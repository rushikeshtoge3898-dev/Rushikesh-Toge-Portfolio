import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useTheme } from '../../context/ThemeContext';
import { applyAppearanceVariables } from '../../lib/appearance';
import { Navbar } from '../Navbar';
import { Hero } from '../Hero';
import { About } from '../About';
import { Skills } from '../Skills';
import { Projects } from '../Projects';
import { Certifications } from '../Certifications';
import { Education } from '../Education';
import { Experience } from '../Experience';
import { Activities } from '../Activities';
import { Contact } from '../Contact';
import { Footer } from '../Footer';

interface CmsLivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CmsLivePreviewModal: React.FC<CmsLivePreviewModalProps> = ({ isOpen, onClose }) => {
  const { cmsConfig } = usePortfolio();
  const { theme } = useTheme();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const widthClass =
    viewport === 'mobile'
      ? 'max-w-[390px]'
      : viewport === 'tablet'
      ? 'max-w-[780px]'
      : 'max-w-full';

  const noop = () => {};

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <Hero key="hero" onOpenResume={noop} />;
      case 'about':
        return <About key="about" />;
      case 'skills':
        return <Skills key="skills" />;
      case 'projects':
        return <Projects key="projects" />;
      case 'certifications':
        return <Certifications key="certifications" />;
      case 'education':
        return <Education key="education" />;
      case 'experience':
        return <Experience key="experience" />;
      case 'activities':
        return <Activities key="activities" />;
      case 'contact':
        return <Contact key="contact" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full h-full flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="text-sm font-bold">Live Public Portfolio Draft Preview</h3>
            <p className="text-[11px] font-mono text-slate-500">
              Previewing current CMS edits before publishing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded text-xs cursor-pointer ${
                  viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-500'
                }`}
                aria-label="Desktop width"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded text-xs cursor-pointer ${
                  viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-500'
                }`}
                aria-label="Tablet width"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded text-xs cursor-pointer ${
                  viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-500'
                }`}
                aria-label="Mobile width"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label="Close live preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-200/60 dark:bg-black/60 p-2 sm:p-4">
          <div
            style={applyAppearanceVariables(cmsConfig.appearance, theme === 'dark')}
            className={`${widthClass} mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 relative`}
          >
            {cmsConfig.settings.maintenanceNotice?.enabled &&
              cmsConfig.settings.maintenanceNotice.message && (
                <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-800 dark:text-amber-200">
                  {cmsConfig.settings.maintenanceNotice.message}
                </div>
              )}
            <div className="pointer-events-none">
              <Navbar onOpenResume={noop} embeddedPreview />
            </div>
            <div>
              {cmsConfig.layout.sections
                .filter((s) => s.visible !== false)
                .map((s) => renderSection(s.id))}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};
