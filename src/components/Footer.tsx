import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUp, Lock, Phone, MapPin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { getContainerClass } from '../lib/appearance';

export const Footer: React.FC = () => {
  const { profile, cmsConfig } = usePortfolio();
  const f = cmsConfig.footer;

  if (f.visible === false) return null;

  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-[#050811] border-t border-slate-200 dark:border-slate-900 py-10 text-slate-500 dark:text-slate-400 text-xs font-mono">
      <div className={`${containerClass} space-y-6`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 block tracking-tight font-sans">
              {profile.name}
            </span>
            <p className="text-slate-500 text-xs">{f.description || profile.headline}</p>
            {f.showContactInfo && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" /> +91 {profile.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {f.showSocialLinks !== false && (
              <>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>

                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>

                <a
                  href={`mailto:${profile.email}`}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {f.showFooterNav && f.footerLinks.length > 0 && (
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 pb-2">
            {f.footerLinks.map((lnk, idx) => (
              <a
                key={`${lnk.label}-${idx}`}
                href={lnk.href}
                target={lnk.isExternal ? '_blank' : undefined}
                rel={lnk.isExternal ? 'noopener noreferrer' : undefined}
                className="text-xs text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {lnk.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <p>
            © {new Date().getFullYear()} {f.copyrightText || `${profile.name}. All rights reserved.`}
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
