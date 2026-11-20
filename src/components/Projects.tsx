import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Github,
  CheckCircle2,
  Users,
  Layers,
  Code2,
  X,
  Info,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const Projects: React.FC = () => {
  const { projects, cmsConfig, resolveUrl } = usePortfolio();
  const [liveDemoNoticeTitle, setLiveDemoNoticeTitle] = useState<string | null>(null);
  const [previewGalleryImg, setPreviewGalleryImg] = useState<{ title: string; url: string } | null>(
    null
  );

  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'projects');
  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const featuredProject = projects.find((p) => p.isFeatured) || projects[0];
  const otherProjects = projects.filter((p) => featuredProject && p.id !== featuredProject.id);

  return (
    <section
      id="projects"
      className={`${paddingClass} border-b border-slate-200 dark:border-slate-800/70`}
    >
      <div className={containerClass}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {secCfg?.title || 'Projects'}
            </h2>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {secCfg?.subtitle || 'Featured Platform & Software Engineering Work'}
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className={`${radiusClass} ${cardStyleClass} p-10 text-center`}>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No published projects available right now.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Project */}
            {featuredProject && (
              <div
                className={`mb-10 bg-white dark:bg-slate-900/90 border border-blue-500/35 ${radiusClass} p-6 sm:p-8 shadow-sm space-y-6`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Featured Project</span>
                    {featuredProject.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{featuredProject.category}</span>
                      </>
                    )}
                    {featuredProject.projectStatus && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{featuredProject.projectStatus}</span>
                      </>
                    )}
                  </div>
                  {featuredProject.role && (
                    <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>
                        Role:{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {featuredProject.role}
                        </strong>
                      </span>
                    </span>
                  )}
                </div>

                {featuredProject.thumbnailUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-80">
                    <img
                      src={resolveUrl(featuredProject.thumbnailUrl)}
                      alt={featuredProject.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
                    {featuredProject.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                    {featuredProject.fullDescription || featuredProject.shortDescription}
                  </p>
                </div>

                {featuredProject.galleryImages && featuredProject.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {featuredProject.galleryImages.map((imgUrl, idx) => {
                      const resolved = resolveUrl(imgUrl);
                      if (!resolved) return null;
                      return (
                        <button
                          key={`${imgUrl}-${idx}`}
                          type="button"
                          onClick={() =>
                            setPreviewGalleryImg({
                              title: `${featuredProject.title} — Screenshot ${idx + 1}`,
                              url: resolved,
                            })
                          }
                          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-24 bg-slate-100 dark:bg-slate-950 cursor-pointer hover:border-blue-500/60 transition-colors"
                        >
                          <img
                            src={resolved}
                            alt={`${featuredProject.title} screenshot ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {featuredProject.keyFeatures?.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-mono uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wider mb-3 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {featuredProject.keyFeatures.map((feature, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {featuredProject.technologies?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider mb-2">
                      Technologies Used
                    </h4>
                    <p className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-200">
                      {featuredProject.technologies.join(' · ')}
                    </p>
                  </div>
                )}

                {featuredProject.personalContribution && (
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    <strong className="block text-blue-600 dark:text-blue-400 font-semibold mb-1 uppercase font-mono tracking-wider">
                      Personal Contribution
                    </strong>
                    {featuredProject.personalContribution}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  {featuredProject.liveDemoUrl && featuredProject.liveDemoUrl.startsWith('http') ? (
                    <a
                      href={featuredProject.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Launch Live Demo</span>
                    </a>
                  ) : featuredProject.liveDemoUrl ? (
                    <button
                      type="button"
                      onClick={() => setLiveDemoNoticeTitle(featuredProject.title)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </button>
                  ) : null}

                  {featuredProject.githubUrl && (
                    <a
                      href={featuredProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition-colors whitespace-nowrap"
                    >
                      <Github className="w-4 h-4" />
                      <span>GitHub Repository</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Additional Published Projects */}
            {otherProjects.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>More Projects</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`${radiusClass} ${cardStyleClass} p-6 hover:border-blue-500/40 transition-colors flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-3">
                        {proj.thumbnailUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 bg-slate-100 dark:bg-slate-950">
                            <img
                              src={resolveUrl(proj.thumbnailUrl)}
                              alt={proj.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                          <span>
                            {proj.category || proj.role || 'Developer'}
                          </span>
                          {proj.projectStatus && <span>{proj.projectStatus}</span>}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {proj.title}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {proj.shortDescription}
                        </p>
                        {proj.galleryImages && proj.galleryImages.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pt-1">
                            {proj.galleryImages.map((imgUrl, idx) => {
                              const resolved = resolveUrl(imgUrl);
                              if (!resolved) return null;
                              return (
                                <button
                                  key={`${imgUrl}-${idx}`}
                                  type="button"
                                  onClick={() =>
                                    setPreviewGalleryImg({
                                      title: `${proj.title} — Screenshot ${idx + 1}`,
                                      url: resolved,
                                    })
                                  }
                                  className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 cursor-pointer"
                                >
                                  <img
                                    src={resolved}
                                    alt={`${proj.title} preview ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {proj.technologies?.length > 0 && (
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {proj.technologies.join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
                        {proj.liveDemoUrl && proj.liveDemoUrl.startsWith('http') && (
                          <a
                            href={proj.liveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 ml-auto"
                          >
                            <Github className="w-3.5 h-3.5" /> GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {liveDemoNoticeTitle && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Info className="w-5 h-5" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Live Demo</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveDemoNoticeTitle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                A live deployment URL has not been added for <strong>{liveDemoNoticeTitle}</strong> yet.
              </p>
            </div>
          </div>
        )}

        {previewGalleryImg && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewGalleryImg(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full p-4 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-mono">{previewGalleryImg.title}</h3>
                <button
                  type="button"
                  onClick={() => setPreviewGalleryImg(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={previewGalleryImg.url}
                alt={previewGalleryImg.title}
                className="w-full max-h-[75vh] object-contain rounded-xl bg-slate-950"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
