import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Briefcase, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    cmsConfig,
    resolveUrl,
    projects,
    certifications,
    skillCategories,
    education,
    experiences,
  } = usePortfolio();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resolvedResumePdf = resolveUrl(profile.resumeUrl);
  const internships = experiences.filter(
    (e) => e.kind === 'internship' || e.kind === 'professional_experience'
  );
  const workshopsAndAchievements = experiences.filter(
    (e) =>
      e.kind === 'workshop' ||
      e.kind === 'industrial_training' ||
      e.kind === 'achievement' ||
      e.kind === 'event' ||
      e.kind === 'volunteering'
  );

  const plainTextResume = `================================================================================
${profile.name.toUpperCase()}
${profile.headline}
Location: ${profile.location} | Phone: ${profile.phone}
Email: ${profile.email}
LinkedIn: ${profile.linkedin}
GitHub: ${profile.github}
================================================================================

PROFESSIONAL SUMMARY
${profile.intro}

EDUCATION
${education
  .map(
    (e) =>
      `• ${e.level} — ${e.institution} (${e.year})\n  ${e.scoreLabel}: ${e.scoreValue}${
        e.details?.length ? ` | ${e.details.join(' | ')}` : ''
      }`
  )
  .join('\n')}

INTERNSHIP & EXPERIENCE
${internships
  .map(
    (i) =>
      `• ${i.title} — ${i.organization} (${i.duration})\n  ${i.description}`
  )
  .join('\n')}

TECHNICAL SKILLS
${skillCategories.map((c) => `${c.title}: ${c.skills.join(', ')}`).join('\n')}

PROJECTS
${projects
  .map(
    (p) =>
      `• ${p.title}${p.role ? ` (${p.role})` : ''}\n  Technologies: ${p.technologies.join(
        ', '
      )}\n  ${p.fullDescription || p.shortDescription}`
  )
  .join('\n')}

CERTIFICATIONS
${certifications
  .map(
    (c) =>
      `• ${c.title} — ${c.issuer} (${c.date})${c.gradeOrScore ? ` | ${c.gradeOrScore}` : ''}`
  )
  .join('\n')}

WORKSHOPS, TRAINING & ACHIEVEMENTS
${workshopsAndAchievements
  .map((w) => `• ${w.title} — ${w.organization} (${w.duration})`)
  .join('\n')}
================================================================================`;

  const copyPlainText = () => {
    navigator.clipboard.writeText(plainTextResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const element = document.createElement('a');
    const file = new Blob([plainTextResume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'Rushikesh_Toge_Resume.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {resolvedResumePdf ? 'Uploaded Resume PDF' : 'ATS Resume View'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {resolvedResumePdf
                  ? profile.resumeFileName || 'Official Resume Document'
                  : 'Generated from live published portfolio records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resolvedResumePdf ? (
              <a
                href={resolvedResumePdf}
                target="_blank"
                rel="noopener noreferrer"
                download={profile.resumeFileName || 'Rushikesh_Toge_Resume.pdf'}
                className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{cmsConfig.resume.buttonText || 'Download PDF'}</span>
              </a>
            ) : (
              <>
                <button
                  type="button"
                  onClick={copyPlainText}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadTextFile}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download .txt</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              aria-label="Close resume modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
          {resolvedResumePdf ? (
            <iframe
              src={resolvedResumePdf}
              title="Rushikesh Toge Resume PDF"
              className="w-full h-[72vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            />
          ) : (
            <>
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white uppercase">
                  {profile.name}
                </h1>
                <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {profile.headline}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {profile.location} · +91 {profile.phone} · {profile.email}
                </p>
              </div>

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                  Summary
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {profile.intro}
                </p>
              </div>

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                  Education
                </h2>
                <div className="space-y-2.5">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between font-bold text-xs text-slate-900 dark:text-slate-100">
                        <span>{edu.level}</span>
                        <span className="font-mono">{edu.year}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{edu.institution}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                        {edu.scoreLabel}: {edu.scoreValue}
                        {edu.details?.length ? ` (${edu.details.join(', ')})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {internships.length > 0 && (
                <div>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                    Experience
                  </h2>
                  {internships.map((intern) => (
                    <div key={intern.id} className="space-y-1 mb-2">
                      <div className="flex justify-between font-bold text-xs text-slate-900 dark:text-slate-100">
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {intern.title} — {intern.organization}
                        </span>
                        <span className="font-mono">{intern.duration}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {intern.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                  Technical Skills
                </h2>
                <ul className="text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300">
                  {skillCategories.map((cat) => (
                    <li key={cat.id}>
                      <strong>{cat.title}:</strong> {cat.skills.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                  Projects
                </h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="mb-3">
                    <div className="flex justify-between font-bold text-xs text-slate-900 dark:text-slate-100">
                      <span>{proj.title}</span>
                      {proj.role && (
                        <span className="font-mono text-blue-600 dark:text-blue-400">
                          {proj.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {proj.fullDescription || proj.shortDescription}
                    </p>
                    {proj.liveDemoUrl?.startsWith('http') && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 dark:text-sky-400 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Live Demo
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
                  Certifications
                </h2>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  {certifications.map((cert) => (
                    <li key={cert.id}>
                      <strong>{cert.title}</strong> — {cert.issuer} ({cert.date})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
