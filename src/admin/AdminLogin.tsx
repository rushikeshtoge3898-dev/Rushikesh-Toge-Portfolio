import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle, LogIn } from 'lucide-react';
import { auth, googleProvider, ADMIN_EMAIL, isVerifiedAdminUser } from '../lib/firebase';
import { usePortfolio } from '../context/PortfolioContext';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, authReady } = usePortfolio();
  const [authMethod, setAuthMethod] = useState<'google' | 'password'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authReady, isAdmin, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!isVerifiedAdminUser(cred.user)) {
        await signOut(auth);
        setError(
          `Access denied for ${cred.user.email || 'this account'}. Only the verified portfolio owner (${ADMIN_EMAIL}) is authorized.`
        );
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isVerifiedAdminUser(cred.user)) {
        await signOut(auth);
        setError(
          `Access denied. Verified email ${ADMIN_EMAIL} is required to access the admin dashboard.`
        );
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Email/password sign-in failed. Ensure Email/Password provider is enabled in Firebase Console.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono font-bold text-lg flex items-center justify-center mx-auto">
            RT
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio Admin Portal</h1>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Authorized Portfolio Owner Access Only
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('google');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                authMethod === 'google'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Google Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Email &amp; Password
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authMethod === 'google' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Sign in with your verified Google account (<strong className="font-mono">{ADMIN_EMAIL}</strong>) to manage projects, certifications, skills, resume, and visitor messages.
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={ADMIN_EMAIL}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your Firebase Auth password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Note: Email/Password sign-in requires enabling the Email/Password provider and creating your user account in the Firebase Console. Google Sign-In works immediately.
              </p>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
