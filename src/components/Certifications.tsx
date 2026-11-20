import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Building,
  ExternalLink,
  ImageIcon,
  FileText,
  X,
  ZoomIn,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Certification } from '../types';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

const isPdfDocument = (resolvedSrc: string, fileType?: string) => {
  if (fileType === 'pdf') return true;
  const src = resolvedSrc || '';
  return (
    src.startsWith('data:application/pdf') ||
    src.toLowerCase().endsWith('.pdf') ||
    src.toLowerCase().includes('application/pdf')
  );
};

export const Certifications: React.FC = () => {
  const { certifications, cmsConfig, resolveUrl } = usePortfolio();
  const [previewCert, setPreviewCert] = useState<Certification | null>(null);

  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'certifications');
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const previewResolved = previewCert ? resolveUrl(previewCert.certificateImage) : '';

  return (
    <section
      id="certifications"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Certifications & Credentials'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Verified Technical, Academic & Professional Credentials'}
            </p>
          </div>
        </div>

        {certifications.length === 0 ? (
          <div className={`${radiusClass} ${cardStyleClass} p-10 text-center`}>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No published certifications available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert) => {
              const resolvedFile = resolveUrl(cert.certificateImage);
              const isPdf = isPdfDocument(resolvedFile, cert.fileType);
              return (
                <article
                  key={cert.id}
                  className={`${radiusClass} ${cardStyleClass} p-6 hover:border-blue-500/40 transition-colors flex flex-col justify-between group`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold truncate">
                        {cert.badgeType || 'Verified Credential'}
                      </span>
                      {cert.gradeOrScore && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                          {cert.gradeOrScore}
                        </span>
                      )}
                    </div>

                    {resolvedFile && (
                      <button
                        type="button"
                        onClick={() => setPreviewCert(cert)}
                        className="w-full mb-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 relative group/img cursor-pointer h-36 flex items-center justify-center p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {isPdf ? (
                          <div className="w-full h-full rounded-lg flex flex-col items-center justify-center text-center space-y-1.5">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-mono">
                              PDF Certificate
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Click to preview document
                            </span>
                          </div>
                        ) : (
                          <img
                            src={resolvedFile}
                            alt={cert.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono gap-1.5">
                          <ZoomIn className="w-4 h-4 text-sky-400" />
                          <span>{isPdf ? 'View PDF' : 'View Certificate'}</span>
                        </div>
                      </button>
                    )}

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                      {cert.title}
                    </h3>

                    <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{cert.issuer}</span>
                    </div>

                    {cert.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {cert.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      {cert.date}
                    </span>

                    {cert.credentialUrl ? (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-sky-400 hover:underline font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </a>
                    ) : cert.credentialId ? (
                      <span className="truncate max-w-[140px]" title={cert.credentialId}>
                        ID: {cert.credentialId}
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Document Preview Modal */}
      {previewCert && previewResolved && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                {isPdfDocument(previewResolved, previewCert.fileType) ? (
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
                <h3 className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                  {previewCert.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewResolved}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={
                    isPdfDocument(previewResolved, previewCert.fileType)
                      ? `${previewCert.title.replace(/\s+/g, '_')}_Certificate.pdf`
                      : undefined
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {isPdfDocument(previewResolved, previewCert.fileType)
                      ? 'Open / Download PDF'
                      : 'Open Full'}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  aria-label="Close certificate preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-auto bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 sm:p-4 flex-1 flex items-center justify-center min-h-[50vh]">
              {isPdfDocument(previewResolved, previewCert.fileType) ? (
                <iframe
                  src={previewResolved}
                  title={previewCert.title}
                  className="w-full h-[75vh] rounded-lg border-0 bg-white dark:bg-slate-900"
                />
              ) : (
                <img
                  src={previewResolved}
                  alt={previewCert.title}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded"
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
