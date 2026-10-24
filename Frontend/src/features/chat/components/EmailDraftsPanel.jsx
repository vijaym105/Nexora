import { useState } from "react";
import EmailDraftCard from "./EmailDraftCard";

const tabClass = (active) =>
  `flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
    active
      ? "border-violet-400/40 bg-white/[0.07] text-white"
      : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
  }`;

const countClass =
  "rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs text-slate-300";

const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" }) : "";

/**
 * The "Email drafts" section: every email the AI drafted for the user, across all chats.
 *
 * props:
 *  - items:      [{ messageId, chatId, chatTitle, emailDraft, createdAt }]
 *  - loading:    boolean
 *  - onSend:     async (item, { to, subject, body }) => void   (throws on failure)
 *  - onOpenChat: (chatId) => void
 */
const EmailDraftsPanel = ({ items, loading, onSend, onOpenChat }) => {
  const [tab, setTab] = useState("draft");

  const unsent = items.filter((d) => d.emailDraft.status !== "sent");
  const sent = items.filter((d) => d.emailDraft.status === "sent");
  const shown = tab === "draft" ? unsent : sent;

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5 backdrop-blur-xl md:px-9">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">Email drafts</h1>
          <p className="mt-1 text-sm text-slate-400">
            {unsent.length} unsent · {sent.length} sent
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setTab("draft")} className={tabClass(tab === "draft")}>
            Drafts <span className={countClass}>{unsent.length}</span>
          </button>
          <button type="button" onClick={() => setTab("sent")} className={tabClass(tab === "sent")}>
            Sent <span className={countClass}>{sent.length}</span>
          </button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto px-6 py-8 md:px-9">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {loading && !items.length && (
            <p className="mt-24 text-center text-sm text-slate-400" role="status">
              Loading your emails...
            </p>
          )}

          {!loading && shown.length === 0 && (
            <div className="mt-24 text-center text-slate-400">
              <p className="text-lg font-medium text-slate-200">
                {tab === "draft" ? "No email drafts yet" : "Nothing sent yet"}
              </p>
              <p className="mt-1 text-sm">
                {tab === "draft"
                  ? "Ask Nexora to write an email, for example “Write an email to my manager asking for Friday off”."
                  : "Emails you send from a draft will be listed here."}
              </p>
            </div>
          )}

          {shown.map((item) => (
            <div key={`${item.messageId}-${item.emailDraft.status}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                <span className="truncate">
                  From chat: <span className="text-slate-300">{item.chatTitle}</span>
                  {item.createdAt ? ` · ${shortDate(item.createdAt)}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenChat(item.chatId)}
                  className="shrink-0 font-medium text-cyan-300 transition hover:text-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  Open chat
                </button>
              </div>
              <EmailDraftCard draft={item.emailDraft} onSend={(fields) => onSend(item, fields)} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default EmailDraftsPanel;
