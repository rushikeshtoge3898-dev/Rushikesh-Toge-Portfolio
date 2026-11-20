import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, FileText, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePortfolio } from '../context/PortfolioContext';
import { getContainerClass, ACCENT_PALETTES } from '../lib/appearance';

interface NavbarProps {
  onOpenResume: () => void;
  embeddedPreview?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenResume, embeddedPreview = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { profile, cmsConfig, resolvedProfilePhotoUrl, resolveUrl } = usePortfolio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const navItems = [...cmsConfig.navigation.items]
    .filter((i) => i.visible !== false)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const mobileNavItems = navItems.filter((i) => i.showOnMobile !== false);
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const accent = ACCENT_PALETTES[cmsConfig.appearance.accentPrimary] || ACCENT_PALETTES.blue;
  const brandAvatar = resolveUrl(cmsConfig.hero.photoOverrideUrl) || resolvedProfilePhotoUrl;

  useEffect(() => {
    if (embeddedPreview) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const scrollPosition = window.scrollY + 130;
      const hashItems = navItems.filter((i) => !i.isExternal && i.href.startsWith('#'));
      for (let i = hashItems.length - 1; i >= 0; i--) {
        const id = hashItems[i].href.slice(1);
        const section = document.getElementById(id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems, embeddedPreview]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isExternal?: boolean
  ) => {
    setMobileMenuOpen(false);
    if (isExternal || !href.startsWith('#')) {
      return;
    }
    e.preventDefault();
    const targetId = href.replace('#', '');
    const elem = document.getElementById(targetId);
    if (elem) {
      const offsetPosition = elem.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      setActiveSection(targetId);
    }
  };

  const brandText = cmsConfig.navigation.brandText || 'RT';
  const resumeLabel = cmsConfig.resume.buttonText
    ? cmsConfig.resume.buttonText.split(' ')[0] === 'Download'
      ? 'Resume'
      : cmsConfig.resume.buttonText
    : 'Resume';

  return (
    <header
      className={`${
        embeddedPreview ? 'sticky top-0' : 'fixed top-0 left-0 right-0'
      } z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#060913]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 py-3'
          : 'bg-white/75 dark:bg-[#060913]/75 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-900/80 py-3.5'
      }`}
    >
      <div className={`${containerClass} flex items-center justify-between gap-6`}>
        {/* Brand Zone */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home', false)}
          className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <span
            style={{
              backgroundColor: accent.softBg,
              borderColor: accent.border,
              color: theme === 'dark' ? accent.textDark : accent.textLight,
            }}
            className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold font-mono text-sm overflow-hidden shrink-0"
          >
            {brandAvatar ? (
              <img
                src={brandAvatar}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              brandText.slice(0, 3)
            )}
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base whitespace-nowrap">
            {brandText}
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((link) => {
            const isHash = !link.isExternal && link.href.startsWith('#');
            const isActive = isHash && activeSection === link.href.slice(1);
            return (
              <a
                key={link.id}
                href={link.href}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleNavClick(e, link.href, link.isExternal)}
                style={
                  isActive
                    ? {
                        color: theme === 'dark' ? accent.textDark : accent.textLight,
                        backgroundColor: accent.softBg,
                      }
                    : undefined
                }
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{link.label}</span>
                {link.isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
              </a>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {profile.showResumeDownload !== false &&
            cmsConfig.settings.showResumeDownload !== false && (
              <button
                type="button"
                onClick={onOpenResume}
                style={{ backgroundColor: accent.hex }}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 text-white transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{resumeLabel}</span>
              </button>
            )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#060913] border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-1.5">
            {mobileNavItems.map((link) => {
              const isHash = !link.isExternal && link.href.startsWith('#');
              const isActive = isHash && activeSection === link.href.slice(1);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.isExternal ? '_blank' : undefined}
                  rel={link.isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavClick(e, link.href, link.isExternal)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
                </a>
              );
            })}
          </div>
          {profile.showResumeDownload !== false &&
            cmsConfig.settings.showResumeDownload !== false && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenResume();
                }}
                style={{ backgroundColor: accent.hex }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>{cmsConfig.resume.buttonText || 'View & Download Resume'}</span>
              </button>
            )}
        </div>
      )}
    </header>
  );
};
