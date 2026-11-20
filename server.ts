import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { createRemoteJWKSet, jwtVerify } from 'jose';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'rushikeshtoge3898@gmail.com').toLowerCase();
const ROOT_DIR = process.cwd();
const UPLOADS_DIR = path.resolve(ROOT_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface FirebaseConfig {
  projectId: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseConfig(): FirebaseConfig {
  const configPath = path.resolve(ROOT_DIR, 'firebase-applet-config.json');
  const raw = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(raw) as FirebaseConfig;
}

const firebaseConfig = loadFirebaseConfig();
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

interface AuthenticatedRequest extends Request {
  adminUser?: {
    uid: string;
    email: string;
  };
}

async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      res.status(401).json({ error: 'Missing authentication token.' });
      return;
    }

    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      audience: firebaseConfig.projectId,
      issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
    });

    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    const emailVerified = payload.email_verified === true;
    const uid = typeof payload.sub === 'string' ? payload.sub : '';

    if (!uid || !emailVerified || email !== ADMIN_EMAIL) {
      res.status(403).json({ error: 'Forbidden: verified portfolio owner access required.' });
      return;
    }

    req.adminUser = { uid, email };
    next();
  } catch (err) {
    console.error('Admin token verification failed:', err instanceof Error ? err.message : err);
    res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

// Sliding-window rate limiter for public contact endpoint
const contactAttempts = new Map<string, number[]>();
const CONTACT_WINDOW_MS = 15 * 60 * 1000;
const CONTACT_MAX_ATTEMPTS = 6;

function checkContactRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const timestamps = (contactAttempts.get(ip) || []).filter((t) => now - t < CONTACT_WINDOW_MS);
  if (timestamps.length >= CONTACT_MAX_ATTEMPTS) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((CONTACT_WINDOW_MS - (now - oldest)) / 1000));
    contactAttempts.set(ip, timestamps);
    return { allowed: false, retryAfterSec };
  }
  timestamps.push(now);
  contactAttempts.set(ip, timestamps);
  return { allowed: true };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

function detectFileSignature(buffer: Buffer, originalName: string, mimeType: string): {
  valid: boolean;
  ext: string;
  fileType: 'image' | 'pdf' | 'svg';
} {
  const lower = originalName.toLowerCase();

  // PDF: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { valid: true, ext: '.pdf', fileType: 'pdf' };
  }

  // PNG: 89 50 4E 47
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, ext: '.png', fileType: 'image' };
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: '.jpg', fileType: 'image' };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, ext: '.webp', fileType: 'image' };
  }

  // SVG: disallow scripts/event handlers
  if (lower.endsWith('.svg') || mimeType === 'image/svg+xml') {
    const text = buffer.toString('utf8');
    const hasSvgTag = /<svg[\s>]/i.test(text);
    const hasUnsafe = /<script|javascript:|on\w+\s*=/i.test(text);
    if (hasSvgTag && !hasUnsafe) {
      return { valid: true, ext: '.svg', fileType: 'svg' };
    }
  }

  return { valid: false, ext: '', fileType: 'image' };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  // Basic security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Serve uploaded files safely
  app.use(
    '/uploads',
    express.static(UPLOADS_DIR, {
      fallthrough: false,
      setHeaders: (res, filePath) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline';");
        }
      },
    })
  );

  app.use('/uploads', (_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({ error: 'Uploaded file not found.' });
  });

  // Contact form validation & rate-limit pre-check
  app.post('/api/contact/check', (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rate = checkContactRateLimit(clientIp);
    if (!rate.allowed) {
      res.status(429).json({
        error: `Too many submissions. Please try again in ${rate.retryAfterSec} seconds.`,
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (name.length < 2 || name.length > 120) {
      res.status(400).json({ error: 'Name must be between 2 and 120 characters.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (subject.length < 2 || subject.length > 200) {
      res.status(400).json({ error: 'Subject must be between 2 and 200 characters.' });
      return;
    }
    if (message.length < 5 || message.length > 4000) {
      res.status(400).json({ error: 'Message must be between 5 and 4000 characters.' });
      return;
    }

    res.json({
      allowed: true,
      sanitized: { name, email, subject, message },
    });
  });

  // Protected admin file upload endpoint (images, certificate PDFs, resume PDF)
  app.post(
    '/api/uploads',
    requireAdmin,
    upload.single('file'),
    (req: AuthenticatedRequest, res: Response) => {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: 'No file provided.' });
        return;
      }

      const categoryRaw = typeof req.body?.category === 'string' ? req.body.category : 'general';
      const category = ['profile', 'project', 'certificate', 'resume', 'experience', 'general'].includes(
        categoryRaw
      )
        ? categoryRaw
        : 'general';

      const sig = detectFileSignature(file.buffer, file.originalname, file.mimetype);
      if (!sig.valid) {
        res.status(400).json({
          error: 'Unsupported or unsafe file format. Allowed formats: PNG, JPG, WEBP, SVG, PDF.',
        });
        return;
      }

      if (category === 'resume' && sig.fileType !== 'pdf') {
        res.status(400).json({ error: 'Resume uploads must be PDF files.' });
        return;
      }

      if (sig.fileType === 'image' && file.size > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'Image size must not exceed 5 MB.' });
        return;
      }

      const safeFilename = `${category}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${sig.ext}`;
      const targetPath = path.join(UPLOADS_DIR, safeFilename);
      fs.writeFileSync(targetPath, file.buffer);

      res.status(201).json({
        url: `/uploads/${safeFilename}`,
        fileName: file.originalname,
        storedName: safeFilename,
        fileType: sig.fileType,
        size: file.size,
      });
    }
  );

  // Multer error handler
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({
        error: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 10 MB upload limit.' : err.message,
      });
      return;
    }
    next(err);
  });

  // Protected admin file delete endpoint
  app.delete('/api/uploads/:filename', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const safeName = path.basename(String(req.params.filename || ''));
    if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
      res.status(400).json({ error: 'Invalid filename.' });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ ok: true });
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
