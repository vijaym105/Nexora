import { useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[15px] text-slate-100 outline-none transition placeholder:text-slate-500 hover:border-white/20 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-60";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

/**
 * Shows an email the AI drafted. The user can edit every field and presses Send;
 * nothing leaves the app until they do.
 *
 * props:
 *  - draft:   { to, subject, body, status: 'draft' | 'sent', sentAt? }
 *  - onSend:  async ({ to, subject, body }) => void   (throws on failure)
 */
const EmailDraftCard = ({ draft, onSend }) => {
  const [to, setTo] = useState(draft.to || "");
  const [subject, setSubject] = useState(draft.subject || "");
  const [body, setBody] = useState(draft.body || "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const isSent = draft.status === "sent";
  const canSend = !sending && to.trim() && subject.trim() && body.trim();

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await onSend({ to: to.trim(), subject: subject.trim(), body: body.trim() });
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          "The email could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-lg shadow-black/20 backdrop-blur-md sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-cyan-300">
          <MailIcon />
          Email draft
        </span>
        {isSent ? (
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            Sent
          </span>
        ) : (
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400">
            Not sent yet
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">To</label>
          <input
            type="email"
            value={isSent ? draft.to : to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isSent || sending}
            placeholder="recipient@example.com"
            aria-label="Recipient email"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Subject</label>
          <input
            type="text"
            value={isSent ? draft.subject : subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSent || sending}
            maxLength={200}
            aria-label="Email subject"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Message</label>
          <textarea
            value={isSent ? draft.body : body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSent || sending}
            rows={9}
            aria-label="Email body"
            className={`${fieldClass} resize-y leading-relaxed`}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {isSent ? (
        <p className="mt-4 text-sm text-emerald-300">
          Email sent to {draft.to}
          {draft.sentAt ? ` on ${new Date(draft.sentAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}` : ""}.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Sent from Nexora with your address as the reply-to.</p>
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send email"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailDraftCard;
