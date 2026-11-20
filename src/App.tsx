import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { applyAppearanceVariables } from './lib/appearance';
import { applySeoToDocument } from './lib/seo';
import { CmsSectionId } from './types';

// Public Portfolio Sections
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Certifications } from './components/Certifications';
import { Education } from './components/Education';
import { Experience } from './components/Experience';
import { Activities } from './components/Activities';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ResumeModal } from './components/ResumeModal';

// Private Admin Dashboard
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProfile } from './admin/AdminProfile';
import { AdminHero } from './admin/AdminHero';
import { AdminAbout } from './admin/AdminAbout';
import { AdminProjects } from './admin/AdminProjects';
import { AdminCertifications } from './admin/AdminCertifications';
import { AdminSkills } from './admin/AdminSkills';
import { AdminEducation } from './admin/AdminEducation';
import { AdminExperience } from './admin/AdminExperience';
import { AdminResume } from './admin/AdminResume';
import { AdminContact } from './admin/AdminContact';
import { AdminNavigation } from './admin/AdminNavigation';
import { AdminFooter } from './admin/AdminFooter';
import { AdminLayoutManager } from './admin/AdminLayoutManager';
import { AdminAppearance } from './admin/AdminAppearance';
import { AdminSeo } from './admin/AdminSeo';
import { AdminMedia } from './admin/AdminMedia';
import { AdminMessages } from './admin/AdminMessages';
import { AdminSettings } from './admin/AdminSettings';

const PublicPortfolioPage: React.FC = () => {
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const { cmsConfig, profile, publicLoading, resolveUrl } = usePortfolio();
  const { theme, setTheme } = useTheme();
  const didSyncDefaultTheme = useRef(false);

  useEffect(() => {
    if (publicLoading || didSyncDefaultTheme.current) return;
    didSyncDefaultTheme.current = true;
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (!saved && cmsConfig.appearance.defaultTheme) {
        setTheme(cmsConfig.appearance.defaultTheme);
      }
    } catch {
      // Ignore storage errors
    }
  }, [publicLoading, cmsConfig.appearance.defaultTheme, setTheme]);

  useEffect(() => {
    applySeoToDocument(
      cmsConfig.seo,
      profile,
      resolveUrl(cmsConfig.seo.ogImage),
      resolveUrl(cmsConfig.seo.faviconUrl)
    );
  }, [cmsConfig.seo, profile, resolveUrl]);

  const renderSection = (id: CmsSectionId) => {
    switch (id) {
      case 'hero':
        return <Hero key="hero" onOpenResume={() => setIsResumeOpen(true)} />;
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
      style={applyAppearanceVariables(cmsConfig.appearance, theme === 'dark')}
      className="cms-public-root min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-700 dark:selection:text-blue-200 transition-colors"
    >
      <Navbar onOpenResume={() => setIsResumeOpen(true)} />

      {cmsConfig.settings.maintenanceNotice?.enabled &&
        cmsConfig.settings.maintenanceNotice.message && (
          <div className="mt-16 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-800 dark:text-amber-200">
            {cmsConfig.settings.maintenanceNotice.message}
          </div>
        )}

      <main className="flex-1">
        {cmsConfig.layout.sections
          .filter((s) => s.visible !== false)
          .map((s) => renderSection(s.id))}
      </main>

      <Footer />

      <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PublicPortfolioPage />} />

              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="hero" element={<AdminHero />} />
                <Route path="about" element={<AdminAbout />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="certifications" element={<AdminCertifications />} />
                <Route path="skills" element={<AdminSkills />} />
                <Route path="education" element={<AdminEducation />} />
                <Route path="experience" element={<AdminExperience />} />
                <Route path="resume" element={<AdminResume />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="navigation" element={<AdminNavigation />} />
                <Route path="footer" element={<AdminFooter />} />
                <Route path="layout" element={<AdminLayoutManager />} />
                <Route path="appearance" element={<AdminAppearance />} />
                <Route path="seo" element={<AdminSeo />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PortfolioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
