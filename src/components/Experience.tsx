import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Code2,
  FileCheck2,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const Experience: React.FC = () => {
  const { experiences, profile, cmsConfig, resolveUrl } = usePortfolio();
  const [certPreview, setCertPreview] = useState<{ title: string; url: string } | null>(null);

  if (
    profile.showExperienceSection === false ||
    cmsConfig.settings.showExperienceSection === false
  ) {
    return null;
  }

  const workItems = experiences.filter(
    (item) => item.kind === 'internship' || item.kind === 'professional_experience'
  );
  if (workItems.length === 0) return null;

  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'experience');
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  return (
    <section
      id="experience"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Internship Experience'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Industry Mentorship & Practical Software Engineering'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {workItems.map((item) => {
            const logoSrc = resolveUrl(item.organizationLogo);
            const certSrc = resolveUrl(item.certificateImage);
            const periodLabel =
              item.startDate || item.endDate
                ? `${item.startDate || ''} – ${item.endDate || 'Present'} (${item.duration})`
                : item.duration;

            return (
              <div
                key={item.id}
                className={`${radiusClass} ${cardStyleClass} p-6 sm:p-8 space-y-5`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
                  <div className="flex items-start gap-3">
                    {logoSrc && (
                      <img
                        src={logoSrc}
                        alt={item.organization}
                        className="w-11 h-11 rounded-lg object-contain border border-slate-200 dark:border-slate-800 bg-white p-1 shrink-0"
                      />
                    )}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          {item.kind === 'professional_experience'
                            ? item.isCurrent
                              ? 'Current Role'
                              : 'Professional Experience'
                            : item.isCurrent
                            ? 'Current Internship'
                            : 'Internship'}
                        </span>
                        {item.domain && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.domain}</span>
                          </>
                        )}
                        {item.workMode && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.workMode}</span>
                          </>
                        )}
                        {item.credentialId && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Intern ID: {item.credentialId}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                        {item.role || item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
                        <Building2 className="w-4 h-4 shrink-0" />
                        <span>{item.organization}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-1 shrink-0 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {periodLabel}
                    </span>
                    {item.commencementDate && <span>Commenced: {item.commencementDate}</span>}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {item.highlights && item.highlights.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Key Responsibilities</span>
                      </h4>
                      <ul className="space-y-2">
                        {item.highlights.map((resp, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {((item.technologies && item.technologies.length > 0) ||
                    (item.skillsLearned && item.skillsLearned.length > 0) ||
                    certSrc ||
                    item.verificationUrl) && (
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {(item.technologies?.length || item.skillsLearned?.length) ? (
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>
                            {[...(item.technologies || []), ...(item.skillsLearned || [])].join(
                              ' · '
                            )}
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-3">
                        {certSrc && (
                          <button
                            type="button"
                            onClick={() => setCertPreview({ title: item.title, url: certSrc })}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Letter / Certificate</span>
                          </button>
                        )}
                        {item.verificationUrl && (
                          <a
                            href={item.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {certPreview && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setCertPreview(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{certPreview.title}</h3>
              <button
                type="button"
                onClick={() => setCertPreview(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {certPreview.url.toLowerCase().includes('pdf') ? (
              <iframe
                src={certPreview.url}
                title={certPreview.title}
                className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <img
                src={certPreview.url}
                alt={certPreview.title}
                className="w-full max-h-[75vh] object-contain rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
};
