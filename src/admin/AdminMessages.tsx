import React, { useState } from 'react';
import { Inbox, Mail, Trash2, Check, MailOpen, ExternalLink, X } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { markContactMessageRead, deleteContactMessage } from '../lib/portfolioService';
import { ContactMessage } from '../types';

export const AdminMessages: React.FC = () => {
  const { adminMessages, refreshAdminData } = usePortfolio();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ContactMessage | null>(null);

  const filtered = adminMessages.filter((m) => {
    if (filter === 'unread' && m.isRead) return false;
    if (filter === 'read' && !m.isRead) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const handleToggleRead = async (msg: ContactMessage) => {
    await markContactMessageRead(msg.id, !msg.isRead);
    await refreshAdminData();
    if (selected?.id === msg.id) {
      setSelected({ ...msg, isRead: !msg.isRead });
    }
  };

  const openDetail = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.isRead) {
      await markContactMessageRead(msg.id, true);
      await refreshAdminData();
    }
  };

  const formatTimestamp = (ts: unknown) => {
    if (ts && typeof ts === 'object' && 'seconds' in ts) {
      return new Date(Number((ts as { seconds: number }).seconds) * 1000).toLocaleString();
    }
    return 'Recent';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, inspect, reply to, and manage visitor contact inquiries stored securely in Firestore.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search sender, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:w-56"
          />
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {(['all', 'unread', 'read'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold">No messages in this view</p>
          <p className="text-xs text-slate-500">
            Submissions from the public Contact form appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openDetail(msg)}
              className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-5 space-y-3 cursor-pointer hover:border-blue-500/60 transition-colors ${
                msg.isRead
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-blue-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className={
                        msg.isRead
                          ? 'text-slate-500'
                          : 'text-blue-600 dark:text-blue-400 font-semibold'
                      }
                    >
                      {msg.isRead ? 'Read' : 'Unread'}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500 tabular-nums">
                      {formatTimestamp(msg.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-1">{msg.subject}</h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    From: {msg.name} ({msg.email})
                  </p>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:text-blue-600"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleToggleRead(msg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    {msg.isRead ? (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(msg)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-500 cursor-pointer"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 whitespace-pre-wrap leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Full Message Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  {formatTimestamp(selected.createdAt)}
                </p>
                <h2 className="text-lg font-bold mt-1">{selected.subject}</h2>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {selected.message}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleToggleRead(selected)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                {selected.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold">Delete Message?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete message from <strong>{confirmDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteContactMessage(confirmDelete.id);
                  if (selected?.id === confirmDelete.id) setSelected(null);
                  await refreshAdminData();
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
