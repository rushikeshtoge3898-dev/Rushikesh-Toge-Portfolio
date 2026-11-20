import React, { useState } from 'react';
import { Bot, Calendar, Eye, X, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ExperienceKind } from '../types';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

const CATEGORY_LABELS: Partial<Record<ExperienceKind, string>> = {
  workshop: 'Technical Training',
  industrial_training: 'Industrial Training',
  achievement: 'Achievement',
  event: 'Event / Hackathon',
  volunteering: 'Volunteering',
};

const isPdfDocument = (src?: string) => {
  if (!src) return false;
  return (
    src.startsWith('data:application/pdf') ||
    src.toLowerCase().endsWith('.pdf') ||
    src.toLowerCase().includes('application/pdf')
  );
};

export const Activities: React.FC = () => {
  const { experiences, profile, cmsConfig, resolveUrl } = usePortfolio();
  const [activeDoc, setActiveDoc] = useState<{ title: string; url: string } | null>(null);

  if (
    profile.showWorkshopsSection === false ||
    cmsConfig.settings.showWorkshopsSection === false
  ) {
    return null;
  }

  const activities = experiences.filter(
    (e) =>
      e.kind === 'workshop' ||
      e.kind === 'industrial_training' ||
      e.kind === 'achievement' ||
      e.kind === 'event' ||
      e.kind === 'volunteering'
  );
  if (activities.length === 0) return null;

  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'activities');
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  return (
    <section
      id="activities"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Workshops, Training & Achievements'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Hands-On Workshops & Co-Curricular Practical Exposure'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((act) => {
            const resolvedDoc = resolveUrl(act.certificateImage);
            const resolvedLogo = resolveUrl(act.organizationLogo);
            const isPdf = isPdfDocument(resolvedDoc);

            return (
              <div
                key={act.id}
                className={`${radiusClass} ${cardStyleClass} p-6 flex flex-col justify-between space-y-4`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {CATEGORY_LABELS[act.kind] || 'Technical Activity'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {act.duration}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    {resolvedLogo && (
                      <img
                        src={resolvedLogo}
                        alt={act.organization}
                        className="w-9 h-9 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-0.5 shrink-0"
                      />
                    )}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                        {act.title}
                      </h3>
                      <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                        {act.organization}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                    {act.description}
                  </p>

                  {resolvedDoc && (
                    <button
                      type="button"
                      onClick={() => setActiveDoc({ title: act.title, url: resolvedDoc })}
                      className="group/img relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 hover:border-blue-500/60 transition-colors cursor-pointer block"
                    >
                      {isPdf ? (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-600 dark:text-slate-300">
                          PDF Training Document — Click to View
                        </div>
                      ) : (
                        <img
                          src={resolvedDoc}
                          alt={act.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs">
                        <Eye className="w-4 h-4" />
                        <span>View Training Certificate</span>
                      </div>
                    </button>
                  )}
                </div>

                {(act.credentialId || act.verificationUrl) && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>{act.credentialId ? `Reg. No: ${act.credentialId}` : ''}</span>
                    {act.verificationUrl && (
                      <a
                        href={act.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeDoc && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-mono truncate">
                {activeDoc.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close certificate preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[50vh]">
              {isPdfDocument(activeDoc.url) ? (
                <iframe
                  src={activeDoc.url}
                  title={activeDoc.title}
                  className="w-full h-[75vh] rounded-lg border-0 bg-white dark:bg-slate-900"
                />
              ) : (
                <img
                  src={activeDoc.url}
                  alt={activeDoc.title}
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
