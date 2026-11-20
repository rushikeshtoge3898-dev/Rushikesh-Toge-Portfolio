import React, { useState, useEffect } from 'react';
import {
  MapPin,
  FileText,
  Mail,
  Github,
  Linkedin,
  Phone,
  ArrowRight,
  Shield,
  GraduationCap,
  Download,
  User,
  X,
  Globe,
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';
import {
  ACCENT_PALETTES,
  getContainerClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

interface HeroProps {
  onOpenResume: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume }) => {
  const { profile, cmsConfig, resolvedProfilePhotoUrl, resolveUrl } = usePortfolio();
  const { theme } = useTheme();
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const hero = cmsConfig.hero;
  const phrases = hero.animatedPhrases || [];

  useEffect(() => {
    if (phrases.length <= 1 || !cmsConfig.appearance.animationsEnabled) return;
    const timer = window.setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [phrases.length, cmsConfig.appearance.animationsEnabled]);

  if (hero.visible === false) return null;

  const isDark = theme === 'dark';
  const accent = ACCENT_PALETTES[cmsConfig.appearance.accentPrimary] || ACCENT_PALETTES.blue;
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const displayName = hero.headingName || profile.name;
  const displayHeadline = hero.subtitle || profile.headline;
  const displayTagline = hero.backgroundTagline || profile.subheadline;
  const displayIntro = hero.introText || profile.intro;
  const heroPhoto = resolveUrl(hero.photoOverrideUrl) || resolvedProfilePhotoUrl;
  const resumeHref = resolveUrl(profile.resumeUrl);
  const resumeBtnText =
    cmsConfig.resume.buttonText || hero.resumeButtonLabel || 'Download Resume';

  const cgpaValue = profile.educationSummary?.cgpa ?? 9.39;
  const interests = profile.interests?.length
    ? profile.interests
    : [
        'Cybersecurity',
        'Ethical Hacking',
        'Network Security',
        'Digital Forensics',
        'Artificial Intelligence',
        'Full-Stack Web Development',
      ];

  const animationsEnabled = cmsConfig.appearance.animationsEnabled !== false;
  const primaryBtnStyle: React.CSSProperties =
    cmsConfig.appearance.buttonStyle === 'outline'
      ? {
          borderColor: accent.hex,
          color: isDark ? accent.textDark : accent.textLight,
          borderWidth: '1.5px',
          backgroundColor: 'transparent',
        }
      : cmsConfig.appearance.buttonStyle === 'soft'
      ? {
          backgroundColor: accent.softBg,
          color: isDark ? accent.textDark : accent.textLight,
          borderColor: accent.border,
          borderWidth: '1px',
        }
      : { backgroundColor: accent.hex, color: '#ffffff' };

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-slate-200 dark:border-slate-800/70"
    >
      {/* Subtle architectural background accent */}
      {cmsConfig.appearance.backgroundEffects !== false && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[760px] h-[420px] rounded-full bg-gradient-to-tr from-blue-600/12 via-cyan-500/8 to-violet-600/10 blur-[120px] -z-10"
        />
      )}

      <div className={containerClass}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Typographic Column */}
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animationsEnabled ? 0.45 : 0 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span
                style={{ color: isDark ? accent.textDark : accent.textLight }}
                className="inline-flex items-center gap-1.5 font-semibold"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{hero.kicker || 'Security & Engineering'}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
              {hero.availabilityText && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{hero.availabilityText}</span>
                  </span>
                </>
              )}
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase leading-[1.06]">
                {displayName}
              </h1>
              <p
                style={{ color: isDark ? accent.textDark : accent.textLight }}
                className="text-lg sm:text-xl font-semibold"
              >
                {displayHeadline}
                {phrases.length > 0 && (
                  <span className="ml-2 text-sm font-mono opacity-85">
                    — {phrases[phraseIndex % phrases.length]}
                  </span>
                )}
              </p>
              {displayTagline && (
                <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                  {displayTagline}
                </p>
              )}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {displayIntro}
              </p>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={hero.primaryCtaHref || '#projects'}
                style={primaryBtnStyle}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl hover:opacity-90 font-semibold text-sm transition-opacity whitespace-nowrap"
              >
                <span>{hero.primaryCtaLabel || 'View My Projects'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={hero.secondaryCtaHref || '#contact'}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4" style={{ color: isDark ? accent.textDark : accent.textLight }} />
                <span>{hero.secondaryCtaLabel || 'Contact Me'}</span>
              </a>

              {profile.showResumeDownload !== false &&
                cmsConfig.settings.showResumeDownload !== false &&
                (resumeHref ? (
                  <a
                    href={resumeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={profile.resumeFileName || 'Rushikesh_Toge_Resume.pdf'}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap"
                  >
                    <Download
                      className="w-4 h-4"
                      style={{ color: isDark ? accent.textDark : accent.textLight }}
                    />
                    <span>{resumeBtnText}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenResume}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: isDark ? accent.textDark : accent.textLight }}
                    />
                    <span>{resumeBtnText}</span>
                  </button>
                ))}
            </div>

            {/* Social & Contact Strip */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>LinkedIn</span>
              </a>

              {(profile.portfolioLinks || []).map((link, idx) => (
                <a
                  key={`${link.label}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{link.label}</span>
                </a>
              ))}

              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{profile.email}</span>
              </a>

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 {profile.phone}</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Right Profile Card */}
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animationsEnabled ? 0.45 : 0, delay: animationsEnabled ? 0.08 : 0 }}
            className="lg:col-span-5"
          >
            <div className={`${radiusClass} ${cardStyleClass} p-6 sm:p-8 shadow-sm space-y-6`}>
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Profile Image Frame */}
                <div
                  style={{ borderColor: accent.border }}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center"
                >
                  {heroPhoto ? (
                    <button
                      type="button"
                      onClick={() => setIsPhotoOpen(true)}
                      className="w-full h-full cursor-pointer focus-visible:outline-none"
                      aria-label="Preview profile image"
                    >
                      <img
                        src={heroPhoto}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-600 dark:text-slate-300">
                      <User className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-1" />
                      <span className="font-mono text-xs font-bold tracking-widest">
                        {cmsConfig.navigation.brandText || 'RT'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{ color: isDark ? accent.textDark : accent.textLight }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>{profile.educationSummary?.degree || 'B.Tech Computer Engineering'}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {profile.educationSummary?.college}
                  </p>
                </div>
              </div>

              {/* Verified Academic Metric */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <div>
                  <span
                    style={{ color: isDark ? accent.textDark : accent.textLight }}
                    className="block text-xl font-bold font-mono tabular-nums"
                  >
                    {cgpaValue.toFixed(2)}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    1st Year CGPA
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {(profile.educationSummary?.sem1SGPA ?? 9.18).toFixed(2)}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Sem 1 SGPA
                  </span>
                </div>
                <div>
                  <span className="block text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {(profile.educationSummary?.sem2SGPA ?? 9.59).toFixed(2)}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Sem 2 SGPA
                  </span>
                </div>
              </div>

              {/* Focus Domains */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Focus Areas
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {interests.slice(0, 6).join(' · ')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Photo Preview Lightbox */}
      {isPhotoOpen && heroPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsPhotoOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPhotoOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={heroPhoto}
              alt={displayName}
              className="w-full aspect-square object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </section>
  );
};
