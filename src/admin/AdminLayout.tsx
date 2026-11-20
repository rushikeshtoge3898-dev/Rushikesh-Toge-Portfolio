import React, { useState } from 'react';
import { Navigate, NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sparkles,
  BookOpen,
  FolderGit2,
  Award,
  Code2,
  GraduationCap,
  Briefcase,
  FileText,
  Mail,
  Navigation,
  PanelBottom,
  Layers,
  Palette,
  Search,
  Image as ImageIcon,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarGroup {
  group: string;
  items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    group: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard }],
  },
  {
    group: 'Content & Sections',
    items: [
      { to: '/admin/profile', label: 'Profile & Personal Info', icon: User },
      { to: '/admin/hero', label: 'Hero Section', icon: Sparkles },
      { to: '/admin/about', label: 'About Section', icon: BookOpen },
      { to: '/admin/projects', label: 'Projects', icon: FolderGit2 },
      { to: '/admin/certifications', label: 'Certifications', icon: Award },
      { to: '/admin/skills', label: 'Skills', icon: Code2 },
      { to: '/admin/education', label: 'Education', icon: GraduationCap },
      { to: '/admin/experience', label: 'Experience & Achievements', icon: Briefcase },
      { to: '/admin/resume', label: 'Resume Manager', icon: FileText },
      { to: '/admin/contact', label: 'Contact Section', icon: Mail },
    ],
  },
  {
    group: 'Site Design & Layout',
    items: [
      { to: '/admin/navigation', label: 'Navigation Menu', icon: Navigation },
      { to: '/admin/footer', label: 'Footer Editor', icon: PanelBottom },
      { to: '/admin/layout', label: 'Section Order & Layout', icon: Layers },
      { to: '/admin/appearance', label: 'Theme & Appearance', icon: Palette },
      { to: '/admin/seo', label: 'SEO & Metadata', icon: Search },
    ],
  },
  {
    group: 'Workspace',
    items: [
      { to: '/admin/media', label: 'Media Manager', icon: ImageIcon },
      { to: '/admin/messages', label: 'Messages Inbox', icon: Inbox },
      { to: '/admin/settings', label: 'Website Settings', icon: Settings },
    ],
  },
];

const ALL_SIDEBAR_ITEMS = SIDEBAR_GROUPS.flatMap((g) => g.items);

export const AdminLayout: React.FC = () => {
  const {
    authReady,
    isAdmin,
    adminMessages,
    adminError,
    cmsDraft,
    profileDraft,
    logoutAdmin,
    hasUnsavedProfileChanges,
    setHasUnsavedProfileChanges,
  } = usePortfolio();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingNavTarget, setPendingNavTarget] = useState<string | null>(null);

  const handleNavAttempt = (e: React.MouseEvent<HTMLAnchorElement>, targetTo: string) => {
    if (hasUnsavedProfileChanges && !location.pathname.startsWith(targetTo)) {
      e.preventDefault();
      setPendingNavTarget(targetTo);
      return;
    }
    setSidebarOpen(false);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060913] flex items-center justify-center p-6">
        <div className="text-sm font-mono text-slate-500 dark:text-slate-400">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  const unreadCount = adminMessages.filter((m) => !m.isRead).length;
  const activeItem = ALL_SIDEBAR_ITEMS.find((item) => location.pathname.startsWith(item.to));

  const renderSidebarLinks = () => (
    <div className="space-y-5">
      {SIDEBAR_GROUPS.map((group) => (
        <div key={group.group} className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {group.group}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={(e) => handleNavAttempt(e, item.to)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`
                }
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.to === '/admin/messages' && unreadCount > 0 && (
                  <span className="text-[11px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-current">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-[#080d1a] border-r border-slate-200 dark:border-slate-800/80">
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
              RT
            </span>
            <span className="font-bold text-sm tracking-tight">Portfolio CMS</span>
          </div>
          {(cmsDraft || profileDraft) && (
            <span
              title="Unpublished drafts exist"
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
            >
              Draft
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Admin Sidebar">
          {renderSidebarLinks()}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-[#080d1a] border-r border-slate-200 dark:border-slate-800 flex flex-col z-10">
            <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm">Portfolio CMS</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">{renderSidebarLinks()}</nav>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={logoutAdmin}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white/85 dark:bg-[#060913]/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
              aria-label="Open admin menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 truncate">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeItem?.label || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {adminError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 text-xs font-mono break-words">
              {adminError}
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {pendingNavTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPendingNavTarget(null)}
        >
          <div
            className="max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Unsaved Changes</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have unsaved edits on this page. Leaving now will discard those unsaved changes unless you save a draft or publish first.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingNavTarget(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
              >
                Stay &amp; Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  const dest = pendingNavTarget;
                  setPendingNavTarget(null);
                  setSidebarOpen(false);
                  setHasUnsavedProfileChanges(false);
                  navigate(dest);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
