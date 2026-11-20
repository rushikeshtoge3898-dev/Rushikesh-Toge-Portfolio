import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  BookCheck,
  Calendar,
  Building2,
  TrendingUp,
  FileText,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const Education: React.FC = () => {
  const { education, profile, cmsConfig, resolveUrl } = usePortfolio();
  const [docPreview, setDocPreview] = useState<{ title: string; url: string } | null>(null);
  const coursework = profile.relevantCoursework || [];

  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'education');
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  return (
    <section
      id="education"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Education'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Academic Background, Scores & Core CS Coursework'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-5">
            {education.map((item) => {
              const logoSrc = resolveUrl(item.institutionLogo);
              const docSrc = resolveUrl(item.supportingDocUrl);
              const periodLabel =
                item.startYear || item.endYear
                  ? `${item.startYear || ''} – ${item.endYear || item.year}`
                  : item.year;

              return (
                <div
                  key={item.id}
                  className={`${radiusClass} p-6 transition-colors ${
                    item.isCurrent
                      ? 'bg-white dark:bg-slate-900 border-2 border-blue-500/40'
                      : `${cardStyleClass}`
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {logoSrc && (
                        <img
                          src={logoSrc}
                          alt={item.institution}
                          className="w-11 h-11 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1 shrink-0"
                        />
                      )}
                      <div>
                        {item.isCurrent && (
                          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                            Current Degree
                          </p>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {item.level}
                          {item.fieldOfStudy ? ` — ${item.fieldOfStudy}` : ''}
                        </h3>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                          <span>{item.institution}</span>
                        </div>
                        {item.boardOrUniversity && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.boardOrUniversity}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {periodLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        <Award className="w-3.5 h-3.5" />
                        {item.scoreLabel}: {item.scoreValue}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {item.details && item.details.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/70 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 text-center flex items-center justify-center gap-1.5"
                        >
                          <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {docSrc && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/70">
                      <button
                        type="button"
                        onClick={() => setDocPreview({ title: item.level, url: docSrc })}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Supporting Document</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`lg:col-span-5 ${radiusClass} ${cardStyleClass} p-6 h-fit`}>
            <div className="flex items-center gap-2 mb-3">
              <BookCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Relevant Coursework
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Academic subjects completed and studied in the B.Tech Computer Engineering curriculum:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {coursework.map((subject) => (
                <li
                  key={subject}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {subject}
                </li>
              ))}
            </ul>

            <p className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
              Savitribai Phule Pune University (SPPU) Curriculum
            </p>
          </div>
        </div>
      </div>

      {docPreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setDocPreview(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{docPreview.title} — Document</h3>
              <button
                type="button"
                onClick={() => setDocPreview(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {docPreview.url.toLowerCase().includes('pdf') ? (
              <iframe
                src={docPreview.url}
                title={docPreview.title}
                className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <img
                src={docPreview.url}
                alt={docPreview.title}
                className="w-full max-h-[75vh] object-contain rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
