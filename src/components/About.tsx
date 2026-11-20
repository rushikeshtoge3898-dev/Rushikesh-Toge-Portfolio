import React from 'react';
import { User, BookOpen, Target, Languages, Compass, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const About: React.FC = () => {
  const { profile, cmsConfig, resolveUrl } = usePortfolio();
  const about = cmsConfig.about;
  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'about');

  if (about.visible === false) return null;

  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const rawBiography = about.biography || profile.aboutText || '';
  const paragraphs = rawBiography
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const interests = profile.interests?.length
    ? profile.interests
    : [
        'Cybersecurity',
        'Ethical Hacking',
        'Network Security',
        'Digital Forensics',
        'Artificial Intelligence',
        'Software Development',
        'Full-Stack Web Development',
        'Emerging Technologies',
      ];

  const spokenLanguages = profile.spokenLanguages?.length
    ? profile.spokenLanguages
    : ['English', 'Hindi', 'Marathi', 'Japanese'];

  const heading = secCfg?.title || about.heading || 'About Me';
  const subtitle =
    secCfg?.subtitle || about.subtitle || 'Background, Technical Focus & Career Goals';

  return (
    <section
      id="about"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {heading}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className={`lg:col-span-7 ${radiusClass} ${cardStyleClass} p-6 sm:p-8 space-y-4`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{about.bioCardTitle || 'Computer Engineering Undergraduate'}</span>
            </h3>

            {about.introParagraph && (
              <p className="text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base leading-relaxed">
                {about.introParagraph}
              </p>
            )}

            {paragraphs.map((para, index) => (
              <p
                key={index}
                className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed"
              >
                {para}
              </p>
            ))}

            {about.careerObjectives && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                  Career Objectives
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {about.careerObjectives}
                </p>
              </div>
            )}

            {about.professionalJourney && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                  Professional Journey
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {about.professionalJourney}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-3">
                Areas of Technical Interest
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {interests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            {about.aboutImages && about.aboutImages.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {about.aboutImages.map((imgUrl, i) => {
                  const resolved = resolveUrl(imgUrl);
                  if (!resolved) return null;
                  return (
                    <img
                      key={`${imgUrl}-${i}`}
                      src={resolved}
                      alt={`About gallery ${i + 1}`}
                      className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className={`${radiusClass} ${cardStyleClass} p-6`}>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Academic Snapshot</span>
              </h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Degree</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 text-right">
                    {profile.educationSummary?.degree}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  <dt className="text-slate-500 dark:text-slate-400">Institution</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 text-right">
                    DYPCOEI, Varale, Pune
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500 dark:text-slate-400">First Year CGPA</dt>
                  <dd className="font-mono font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {(profile.educationSummary?.cgpa ?? 9.39).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className={`${radiusClass} ${cardStyleClass} p-6`}>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-200 uppercase font-mono tracking-wider mb-3 flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Spoken Languages</span>
              </h3>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {spokenLanguages.join(' · ')}
              </p>
            </div>

            <div className={`p-5 ${radiusClass} bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 text-xs text-slate-700 dark:text-blue-100 leading-relaxed flex gap-3 items-start`}>
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold mb-0.5">
                  {profile.educationSummary?.college ||
                    'Dr. D. Y. Patil College of Engineering and Innovation, Varale, Pune'}
                </strong>
                <span>{profile.location} · Continuous practical engineering &amp; security learning.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
