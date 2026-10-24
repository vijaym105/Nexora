import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat, TEMP_CHAT_ID } from "../hooks/useChat";
import EmailDraftCard from "../components/EmailDraftCard";
import EmailDraftsPanel from "../components/EmailDraftsPanel";

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const LayersIcon = (p) => (
  <Icon {...p}>
    <path d="M12 3 3 8l9 5 9-5-9-5Z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 17.5 9 5 9-5" opacity=".0" />
  </Icon>
);
const PlusIcon = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
const SendIcon = (p) => (
  <Icon {...p}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
  </Icon>
);
const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M6 6l1 14h10l1-14" />
    <path d="M10 11v5M14 11v5" />
  </Icon>
);
const MailIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </Icon>
);


const shortDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" })
    : "";


/* ---------- Message renderer ---------- */
function MessageBody({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" className="text-sky-300 underline underline-offset-2">
            {children}
          </a>
        ),
        code: ({ children }) => <code className="rounded bg-white/10 px-1 py-0.5 text-[15px]">{children}</code>,
        pre: ({ children }) => <pre className="mb-3 overflow-x-auto rounded-xl bg-black/30 p-3 last:mb-0">{children}</pre>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

/* ---------- Dashboard ---------- */
const Dashboard = ({ onLogout = () => {} }) => {
  const chat = useChat();
  const authUser = useSelector((state) => state.auth.user);

  const displayName = authUser?.username || authUser?.name || "User Account";
  const user = {
    name: displayName,
    email: authUser?.email || "",
    initial: displayName.charAt(0).toUpperCase(),
  };

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const typing = useSelector((state) => state.chat.isLoading);
  const emailDrafts = useSelector((state) => state.chat.emailDrafts);
  const unsentEmails = emailDrafts.items.filter((d) => d.emailDraft.status !== "sent").length;

  // "chat" = the conversation, "emails" = the Email drafts section
  const [view, setView] = useState("chat");

  // connect socket and load the chat list once on mount
  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
    chat.handleGetEmailDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const taRef = useRef(null);

  const active = chats[currentChatId];
  const activeMessages = active?.messages ?? [];

  // newest chats first
  const chatList = useMemo(
    () =>
      Object.values(chats).sort(
        (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
      ),
    [chats]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages.length, typing]);

  // auto-grow textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [draft]);

  const deleteConversation = async (c) => {
    if (!window.confirm(`Delete "${c.title}"? This can't be undone.`)) return;
    try {
      await chat.handleDeleteChat(c.id);
    } catch (err) {
      window.alert(err.response?.data?.message || "Could not delete this chat. Please try again.");
    }
  };

  const openChatFromAnywhere = (chatId) => {
    setView("chat");
    chat.handleOpenChat(chatId, chats);
  };

  const newConversation = () => {
    setView("chat");
    chat.handleNewChat();
    setDraft("");
    taRef.current?.focus();
  };

  const send = () => {
    const text = draft.trim();
    if (!text || typing) return;
    chat.handleSendMessage({ message: text, chatId: currentChatId });
    setDraft("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#06040f] font-sans text-slate-100 antialiased">
      {/* ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-700/25 blur-[140px]" />
        <div className="absolute -bottom-52 right-0 h-[560px] w-[560px] rounded-full bg-blue-600/20 blur-[160px]" />
      </div>

      {/* ---------- Sidebar ---------- */}
      <aside className="relative z-10 hidden w-[330px] shrink-0 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl md:flex">
        <div className="flex items-center justify-between px-5 pb-4 pt-9">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg shadow-violet-500/30">
              <LayersIcon />
            </div>
            <span className="text-2xl font-bold tracking-tight">Nexora</span>
          </div>
          <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
            Beta
          </span>
        </div>

        <div className="px-5">
          <button
            onClick={newConversation}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-violet-500/10 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-violet-400/40 hover:bg-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <PlusIcon className="h-5 w-5 text-slate-300" />
            New conversation
          </button>

          <button
            type="button"
            onClick={() => setView("emails")}
            aria-current={view === "emails" ? "page" : undefined}
            className={`mt-2 flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
              view === "emails"
                ? "border-violet-400/40 bg-white/[0.07] text-white"
                : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]"
            }`}
          >
            <MailIcon className="h-5 w-5 text-cyan-300" />
            <span className="flex-1">Email drafts</span>
            {unsentEmails > 0 && (
              <span
                aria-label={`${unsentEmails} unsent email drafts`}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-300"
              >
                {unsentEmails}
              </span>
            )}
          </button>
        </div>

        <p className="px-7 pb-3 pt-8 text-xs font-medium tracking-[0.14em] text-slate-500">
          RECENT
        </p>

        <nav className="flex-1 space-y-1 overflow-y-auto px-5 pb-4">
          {chatList.map((c) => {
            const isActive = view === "chat" && c.id === currentChatId;
            return (
              <div key={c.id} className="group relative">
                <button
                  onClick={() => openChatFromAnywhere(c.id)}
                  className={`w-full rounded-xl border py-3.5 pl-4 pr-11 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    isActive
                      ? "border-violet-400/40 bg-white/[0.07]"
                      : "border-transparent hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="block truncate text-[15px] font-semibold text-slate-100">
                    {c.title}
                  </span>
                  <span className="mt-1 block truncate text-sm text-slate-400">
                    {c.messages.length
                      ? c.messages[c.messages.length - 1].content
                      : shortDate(c.lastUpdated)}
                  </span>
                </button>
                {c.id !== TEMP_CHAT_ID && (
                  <button
                    type="button"
                    onClick={() => deleteConversation(c)}
                    disabled={typing}
                    aria-label={`Delete chat ${c.title}`}
                    title="Delete chat"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 opacity-0 transition hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100 group-hover:disabled:opacity-40"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-5">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 font-semibold">
              {user.initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-sm text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              aria-label="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        {view === "emails" ? (
          <EmailDraftsPanel
            items={emailDrafts.items}
            loading={emailDrafts.loading}
            onSend={(item, { to, subject, body }) =>
              chat.handleSendEmail({
                chatId: item.chatId,
                messageId: item.messageId,
                to,
                subject,
                body,
              })
            }
            onOpenChat={openChatFromAnywhere}
          />
        ) : (
          <>
        <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-5 backdrop-blur-xl md:px-9">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">
              {active?.title ?? "New conversation"}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {activeMessages.length} message
              {activeMessages.length === 1 ? "" : "s"}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            Nexora Pro
          </span>
        </header>

        {/* messages */}
        <section className="flex-1 overflow-y-auto px-6 py-8 md:px-9">
          <div className="mx-auto flex max-w-5xl flex-col gap-8">
            {activeMessages.length === 0 && (
              <div className="mt-24 text-center text-slate-400">
                <p className="text-lg font-medium text-slate-200">
                  Start the conversation
                </p>
                <p className="mt-1 text-sm">
                  Ask Nexora anything about your project.
                </p>
              </div>
            )}

            {activeMessages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex flex-col items-end gap-2">
                  <div className="flex items-start gap-4">
                    <div className="max-w-2xl rounded-2xl rounded-tr-md border border-violet-400/20 bg-gradient-to-br from-violet-600/30 to-indigo-600/20 px-5 py-4 text-[17px] shadow-lg shadow-black/20">
                      {m.content}
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 font-semibold">
                      {user.initial}
                    </div>
                  </div>
                  <span className="mr-14 text-xs text-slate-400">{m.time}</span>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 text-white">
                      <LayersIcon className="h-5 w-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0818] bg-emerald-400" />
                  </div>
                  <div className="flex max-w-[46rem] flex-col gap-2">
                    <div className="rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.05] px-5 py-4 text-[17px] leading-relaxed text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md">
                      <MessageBody text={m.content} />
                    </div>
                    {m.emailDraft && m.id && (
                      <EmailDraftCard
                        key={`${m.id}-${m.emailDraft.status}`}
                        draft={m.emailDraft}
                        onSend={({ to, subject, body }) =>
                          chat.handleSendEmail({
                            chatId: currentChatId,
                            messageId: m.id,
                            to,
                            subject,
                            body,
                          })
                        }
                      />
                    )}
                    <span className="text-xs text-sky-300/80">{m.time}</span>
                  </div>
                </div>
              )
            )}

            {typing && (
              <div className="flex items-center gap-4" aria-live="polite">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-500">
                  <LayersIcon className="h-5 w-5" />
                </div>
                <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      style={{ animationDelay: `${d}ms` }}
                      className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </section>

        {/* composer */}
        <footer className="px-6 pb-6 md:px-9">
          <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.04] px-5 pb-3 pt-4 backdrop-blur-xl transition focus-within:border-violet-400/50">
            <div className="flex items-end gap-3">
              <textarea
                ref={taRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Message Nexora... (Enter to send)"
                className="max-h-40 flex-1 resize-none bg-transparent py-1 text-[17px] text-slate-100 placeholder-slate-500 outline-none"
              />
              <button
                onClick={send}
                disabled={!draft.trim() || typing}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition enabled:hover:bg-violet-500 enabled:hover:text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <SendIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">
              Nexora may make mistakes. Verify important information.
            </p>
          </div>
        </footer>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
