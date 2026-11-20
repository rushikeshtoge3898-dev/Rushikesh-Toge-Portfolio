import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Award,
  Code2,
  GraduationCap,
  Inbox,
  FileText,
  RefreshCw,
  ArrowRight,
  User,
  Briefcase,
  Wrench,
  Trophy,
  Palette,
  Layers,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

function formatLastUpdated(raw: unknown, fallbackLabel?: string): string {
  if (fallbackLabel) {
    const d = new Date(fallbackLabel);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }
  const sec = (raw as { seconds?: number } | undefined)?.seconds;
  if (typeof sec === 'number') {
    return new Date(sec * 1000).toLocaleString();
  }
  return 'Synced with Firestore';
}

export const AdminDashboard: React.FC = () => {
  const {
    profile,
    profileDraft,
    adminCmsConfig,
    cmsDraft,
    resolvedProfilePhotoUrl,
    adminProjects,
    adminCertifications,
    adminSkillCategories,
    adminEducation,
    adminExperiences,
    adminMessages,
    mediaAssets,
    adminLoading,
    refreshAdminData,
  } = usePortfolio();

  const publishedProjects = adminProjects.filter((p) => p.status !== 'draft').length;
  const draftProjects = adminProjects.filter((p) => p.status === 'draft').length;
  const publishedCerts = adminCertifications.filter((c) => c.status !== 'draft').length;
  const draftCerts = adminCertifications.filter((c) => c.status === 'draft').length;
  const totalSkills = adminSkillCategories.reduce((acc, c) => acc + c.skills.length, 0);
  const unreadMessages = adminMessages.filter((m) => !m.isRead).length;

  const internshipsCount = adminExperiences.filter((e) => e.kind === 'internship').length;
  const workshopsCount = adminExperiences.filter((e) => e.kind === 'workshop').length;
  const trainingCount = adminExperiences.filter((e) => e.kind === 'industrial_training').length;
  const proExpCount = adminExperiences.filter((e) => e.kind === 'professional_experience').length;
  const achievementsCount = adminExperiences.filter(
    (e) => e.kind === 'achievement' || e.kind === 'event' || e.kind === 'volunteering'
  ).length;

  const lastUpdatedText = formatLastUpdated(
    adminCmsConfig.updatedAt,
    adminCmsConfig.settings?.lastUpdatedLabel
  );

  const stats = [
    {
      label: 'Profile & Personal Info',
      value: profileDraft
        ? 'Unpublished profile draft pending'
        : resolvedProfilePhotoUrl
        ? `${profile.name} · Photo active`
        : `${profile.name} · Bio & details`,
      to: '/admin/profile',
      icon: User,
    },
    {
      label: 'Projects',
      value: `${publishedProjects} published / ${draftProjects} draft`,
      to: '/admin/projects',
      icon: FolderGit2,
    },
    {
      label: 'Certifications',
      value: `${publishedCerts} published / ${draftCerts} draft`,
      to: '/admin/certifications',
      icon: Award,
    },
    {
      label: 'Skills & Categories',
      value: `${totalSkills} skills in ${adminSkillCategories.length} categories`,
      to: '/admin/skills',
      icon: Code2,
    },
    {
      label: 'Education Records',
      value: `${adminEducation.length} academic credentials`,
      to: '/admin/education',
      icon: GraduationCap,
    },
    {
      label: 'Internships & Experience',
      value: `${internshipsCount} internships · ${proExpCount} experience`,
      to: '/admin/experience',
      icon: Briefcase,
    },
    {
      label: 'Workshops & Training',
      value: `${workshopsCount} workshops · ${trainingCount} industrial`,
      to: '/admin/experience',
      icon: Wrench,
    },
    {
      label: 'Achievements & Events',
      value: `${achievementsCount} records`,
      to: '/admin/experience',
      icon: Trophy,
    },
    {
      label: 'Contact Messages',
      value: `${unreadMessages} unread (${adminMessages.length} total)`,
      to: '/admin/messages',
      icon: Inbox,
    },
    {
      label: 'Resume Versions',
      value: `${adminCmsConfig.resume.versions.length} stored · ${
        profile.resumeUrl ? profile.resumeFileName || 'PDF active' : 'ATS Summary Mode'
      }`,
      to: '/admin/resume',
      icon: FileText,
    },
    {
      label: 'Media Library',
      value: `${mediaAssets.length} persistent assets`,
      to: '/admin/media',
      icon: ImageIcon,
    },
    {
      label: 'Theme & Section Layout',
      value: cmsDraft
        ? 'CMS draft pending publish'
        : `${adminCmsConfig.appearance.accentPrimary} accent · ${
            adminCmsConfig.layout.sections.filter((s) => s.visible).length
          } visible sections`,
      to: '/admin/appearance',
      icon: Palette,
    },
  ];

  const quickActions = [
    { label: 'Hero Manager', to: '/admin/hero', icon: Sparkles },
    { label: 'Manage Projects', to: '/admin/projects', icon: FolderGit2 },
    { label: 'Manage Certifications', to: '/admin/certifications', icon: Award },
    { label: 'Section Order', to: '/admin/layout', icon: Layers },
    { label: 'Theme & Fonts', to: '/admin/appearance', icon: Palette },
    { label: 'Media Manager', to: '/admin/media', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete CMS control center for {profile.name}&apos;s public portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Updated: {lastUpdatedText}</span>
          </div>
          <button
            type="button"
            onClick={refreshAdminData}
            disabled={adminLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
            <span>{adminLoading ? 'Syncing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Pending Draft Banner */}
      {(cmsDraft || profileDraft) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            You have unpublished draft edits ({profileDraft ? 'Profile' : ''}
            {profileDraft && cmsDraft ? ' & ' : ''}
            {cmsDraft ? 'Site CMS' : ''}). Visitors only see published changes until you publish them.
          </p>
          <div className="flex gap-2">
            {profileDraft && (
              <Link
                to="/admin/profile"
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold"
              >
                Review Profile Draft
              </Link>
            )}
            {cmsDraft && (
              <Link
                to="/admin/hero"
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold"
              >
                Review CMS Draft
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>Open Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <Link
                key={qa.to}
                to={qa.to}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-xs font-semibold transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{qa.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100 truncate">
                  {item.value}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Unread Messages */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Recent Visitor Messages</h2>
          <Link
            to="/admin/messages"
            className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open Inbox
          </Link>
        </div>

        {adminMessages.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No visitor messages yet. Submissions from the public contact form appear here.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {adminMessages.slice(0, 4).map((msg) => (
              <div key={msg.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {msg.subject}{' '}
                    {!msg.isRead && (
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 ml-1">
                        (Unread)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {msg.name} · {msg.email}
                  </p>
                </div>
                <Link
                  to="/admin/messages"
                  className="text-xs font-mono text-blue-600 dark:text-blue-400 shrink-0 hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
