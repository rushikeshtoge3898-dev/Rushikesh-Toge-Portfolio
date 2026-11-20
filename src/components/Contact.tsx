import React, { useState } from 'react';
import {
  Mail,
  Linkedin,
  Github,
  Phone,
  MapPin,
  Send,
  Copy,
  Check,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { submitContactMessage } from '../lib/portfolioService';
import {
  getContainerClass,
  getSectionPaddingClass,
  getRadiusClass,
  getCardStyleClass,
} from '../lib/appearance';

export const Contact: React.FC = () => {
  const { profile, cmsConfig } = usePortfolio();
  const cCfg = cmsConfig.contact;
  const secCfg = cmsConfig.layout.sections.find((s) => s.id === 'contact');

  const containerClass = getContainerClass(cmsConfig.appearance.containerWidth);
  const paddingClass = getSectionPaddingClass(cmsConfig.appearance.sectionSpacing, secCfg?.spacing);
  const radiusClass = getRadiusClass(cmsConfig.appearance.borderRadius);
  const cardStyleClass = getCardStyleClass(cmsConfig.appearance.cardStyle);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setSubmitting(true);
    try {
      await submitContactMessage(formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const formVisible = cCfg.formVisible !== false;

  return (
    <section id="contact" className={paddingClass}>
      <div className={containerClass}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {secCfg?.title || cCfg.heading || 'Contact Me'}
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {secCfg?.subtitle ||
                  cCfg.subtitle ||
                  'Open to Internships, Security & Engineering Collaboration'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs self-start md:self-auto">
            <span className="font-mono text-slate-600 dark:text-slate-300">{profile.email}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(profile.email, 'emailTop')}
              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedField === 'emailTop' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div
            className={`${
              formVisible ? 'lg:col-span-5' : 'lg:col-span-12'
            } ${radiusClass} ${cardStyleClass} p-6 space-y-5`}
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5">
                {cCfg.directInfoHeading || 'Direct Information'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {cCfg.directInfoIntro ||
                  'Send a message using the form or reach out directly via email, phone, GitHub, or LinkedIn.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[11px] font-mono text-slate-500">Email</span>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(profile.email, 'cardEmail')}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  aria-label="Copy email"
                >
                  {copiedField === 'cardEmail' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {profile.phone && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-[11px] font-mono text-slate-500">Phone</span>
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 truncate block"
                      >
                        +91 {profile.phone}
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(profile.phone, 'cardPhone')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    aria-label="Copy phone"
                  >
                    {copiedField === 'cardPhone' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[11px] font-mono text-slate-500">Location</span>
                  <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                    {profile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Github className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
              </a>

              {(profile.portfolioLinks || []).map((link, idx) => (
                <a
                  key={`${link.label}-${idx}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="truncate">{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 ml-auto shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Backend-Persisted Contact Form */}
          {formVisible && (
            <div className={`lg:col-span-7 ${radiusClass} ${cardStyleClass} p-6 sm:p-8 space-y-5`}>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>{cCfg.formHeading || 'Send a Message'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {cCfg.formSubtext || "Messages are delivered securely to Rushikesh's inbox."}
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Your message has been sent and saved! Thank you for reaching out.</span>
                </div>
              )}

              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {cCfg.nameLabel || 'Name *'}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={120}
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {cCfg.emailLabel || 'Email *'}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={160}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {cCfg.subjectLabel || 'Subject *'}
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    minLength={2}
                    maxLength={200}
                    placeholder="Internship inquiry, collaboration, or question"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {cCfg.messageLabel || 'Message *'}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    minLength={5}
                    maxLength={4000}
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Sending...' : cCfg.submitLabel || 'Send Message'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
