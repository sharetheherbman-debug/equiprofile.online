/**
 * SalesChatWidget
 *
 * Self-contained floating chat widget for marketing pages only.
 *
 * Rules enforced:
 * - Zero global CSS changes (all styles are inline or scoped via data attributes)
 * - Renders ONLY on allowlisted public marketing routes
 * - Mobile: fullscreen overlay with safe-area padding
 * - Desktop: bottom-right panel (420px wide, 70vh max)
 * - Lead capture step when user asks to speak to a human or leaves email
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

// ──────────────────────────────────────────────────────────
// Route allowlist — only show on public marketing pages
// ──────────────────────────────────────────────────────────
const ALLOWED_ROUTES = new Set([
  "/",
  "/features",
  "/pricing",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LeadForm {
  name: string;
  email: string;
}

type Step = "chat" | "lead";

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm the EquiProfile assistant. I can help you with questions about horse health tracking, training logs, scheduling, billing, and everything else in the platform. What would you like to know?",
};

// ──────────────────────────────────────────────────────────
// Scoped styles (injected once into document.head)
// ──────────────────────────────────────────────────────────
const WIDGET_STYLE_ID = "equip-chat-widget-styles";

function injectStyles(): void {
  if (document.getElementById(WIDGET_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = WIDGET_STYLE_ID;
  style.textContent = `
/* EquiProfile Chat Widget – isolated styles, do not edit */
[data-equip-chat] * { box-sizing: border-box; }
[data-equip-chat] {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9998;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
[data-equip-chat-btn] {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(99,102,241,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
[data-equip-chat-btn]:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(99,102,241,0.6);
}
[data-equip-chat-badge] {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}
[data-equip-chat-panel] {
  position: fixed;
  bottom: 96px;
  right: 24px;
  width: min(420px, calc(100vw - 32px));
  max-height: 70vh;
  background: #f0f7ff;
  border: 1px solid rgba(99,102,241,0.18);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(99,102,241,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: equipChatSlideUp 0.25s ease;
  z-index: 9999;
}
@keyframes equipChatSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (max-width: 480px) {
  [data-equip-chat-panel] {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 100%;
    border-radius: 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  [data-equip-chat] {
    bottom: 16px;
    right: 16px;
  }
}
[data-equip-chat-header] {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.10));
  border-bottom: 1px solid rgba(99,102,241,0.12);
  flex-shrink: 0;
}
[data-equip-chat-avatar] {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
[data-equip-chat-header-info] {
  flex: 1;
  min-width: 0;
}
[data-equip-chat-header-name] {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
}
[data-equip-chat-header-status] {
  color: #16a34a;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}
[data-equip-chat-header-status]::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
  display: inline-block;
}
[data-equip-chat-close] {
  background: none;
  border: none;
  color: rgba(30,41,59,0.4);
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  line-height: 1;
  border-radius: 4px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
[data-equip-chat-close]:hover { color: #1e293b; background: rgba(99,102,241,0.08); }
[data-equip-chat-messages] {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(99,102,241,0.2) transparent;
}
[data-equip-chat-messages]::-webkit-scrollbar { width: 4px; }
[data-equip-chat-messages]::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 2px; }
[data-equip-msg] {
  display: flex;
  gap: 8px;
  max-width: 90%;
}
[data-equip-msg="user"] { margin-left: auto; flex-direction: row-reverse; }
[data-equip-msg-bubble] {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
[data-equip-msg="assistant"] [data-equip-msg-bubble] {
  background: #ffffff;
  color: #1e293b;
  border: 1px solid rgba(99,102,241,0.12);
  border-bottom-left-radius: 4px;
}
[data-equip-msg="user"] [data-equip-msg-bubble] {
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  color: #fff;
  border-bottom-right-radius: 4px;
}
[data-equip-typing] {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 14px;
}
[data-equip-typing] span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(99,102,241,0.5);
  animation: equipBlink 1.2s infinite;
}
[data-equip-typing] span:nth-child(2) { animation-delay: 0.2s; }
[data-equip-typing] span:nth-child(3) { animation-delay: 0.4s; }
@keyframes equipBlink {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
[data-equip-chat-input-row] {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(99,102,241,0.12);
  flex-shrink: 0;
  align-items: flex-end;
}
[data-equip-chat-textarea] {
  flex: 1;
  background: #ffffff;
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 10px;
  color: #1e293b;
  font-size: 14px;
  padding: 10px 12px;
  resize: none;
  min-height: 42px;
  max-height: 120px;
  line-height: 1.5;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
[data-equip-chat-textarea]::placeholder { color: rgba(30,41,59,0.4); }
[data-equip-chat-textarea]:focus { border-color: rgba(99,102,241,0.5); }
[data-equip-send-btn] {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.2s, transform 0.1s;
}
[data-equip-send-btn]:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
[data-equip-send-btn]:disabled { opacity: 0.4; cursor: not-allowed; }
[data-equip-chat-lead] {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
[data-equip-lead-title] {
  color: #1e293b;
  font-weight: 600;
  font-size: 15px;
}
[data-equip-lead-sub] { color: rgba(30,41,59,0.6); font-size: 13px; }
[data-equip-lead-input] {
  background: #ffffff;
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 8px;
  color: #1e293b;
  font-size: 14px;
  padding: 10px 12px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
[data-equip-lead-input]::placeholder { color: rgba(30,41,59,0.35); }
[data-equip-lead-input]:focus { border-color: rgba(99,102,241,0.5); }
[data-equip-lead-submit] {
  padding: 12px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #06b6d4);
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}
[data-equip-lead-submit]:hover { opacity: 0.85; }
[data-equip-lead-submit]:disabled { opacity: 0.5; cursor: not-allowed; }
[data-equip-lead-skip] {
  background: none;
  border: none;
  color: rgba(30,41,59,0.4);
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  padding: 4px;
  text-decoration: underline;
}
[data-equip-lead-error] {
  color: #dc2626;
  font-size: 12px;
}
[data-equip-suggestions] {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0 8px;
}
[data-equip-suggestion] {
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2);
  color: #4f46e5;
  font-size: 12px;
  border-radius: 20px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  font-family: inherit;
}
[data-equip-suggestion]:hover { background: rgba(99,102,241,0.16); }
`;
  document.head.appendChild(style);
}

// ──────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────

/** Detects messages where the user wants to speak with a human / be contacted. */
const LEAD_INTENT_PATTERN =
  /\b(human|agent|person|staff|speak|talk|contact|email me|reach out)\b/i;

/** Basic email validation (same pattern as backend salesChatRouter.ts). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ──────────────────────────────────────────────────────────
// Quick suggestion chips
// ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "How does the 7-day free trial work?",
  "Can I track health records for multiple horses?",
  "What does the scheduling feature include?",
  "How do I get started?",
];

// ──────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────
export function SalesChatWidget() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // Authenticated users skip lead capture; anonymous users start at "lead"
  const [step, setStep] = useState<Step>(isAuthenticated ? "chat" : "lead");
  const [lead, setLead] = useState<LeadForm>({ name: "", email: "" });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [leadDone, setLeadDone] = useState(isAuthenticated);
  const [unread, setUnread] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inject scoped styles on mount
  useEffect(() => {
    injectStyles();
  }, []);

  // Skip lead form when user logs in mid-session
  useEffect(() => {
    if (isAuthenticated) {
      setStep("chat");
      setLeadDone(true);
    }
  }, [isAuthenticated]);

  // Only render on allowlisted routes
  const isAllowed =
    ALLOWED_ROUTES.has(location) ||
    // also allow exact match with trailing slash
    ALLOWED_ROUTES.has(location.replace(/\/$/, "") || "/");

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-focus textarea when panel opens
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setShowSuggestions(false);

      // Detect lead-capture intent
      const wantsHuman = LEAD_INTENT_PATTERN.test(trimmed);

      try {
        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Natural typing delay (1.2–1.8 s) so replies don't feel instant/spammy
        const [resp] = await Promise.all([
          fetch("/api/sales-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: trimmed, history }),
          }),
          new Promise((resolve) =>
            setTimeout(resolve, 1200 + Math.random() * 600),
          ),
        ]);

        const data = await resp.json();
        const reply =
          data.reply || "Sorry, I couldn't get a response. Please try again.";

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (!open) {
          setUnread((u) => u + 1);
        }

        // Show lead form if user wants to speak with someone
        if (wantsHuman && !leadDone) {
          setTimeout(() => setStep("lead"), 800);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content:
              "Sorry, I'm having trouble connecting right now. Email us at hello@equiprofile.online.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, open, leadDone],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleLeadSubmit = async () => {
    setLeadError("");
    if (!lead.name.trim() || lead.name.trim().length < 2) {
      setLeadError("Please enter your name.");
      return;
    }
    if (!EMAIL_REGEX.test(lead.email.trim())) {
      setLeadError("Please enter a valid email address.");
      return;
    }

    setLeadSubmitting(true);
    try {
      const resp = await fetch("/api/sales-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name.trim(),
          email: lead.email.trim(),
          source: "chat",
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed");
      setLeadDone(true);
      setStep("chat");
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: `Thanks, ${lead.name.split(" ")[0]}! 🎉 We've got your details and our team will reach out to ${lead.email} soon. Is there anything else I can help you with?`,
        },
      ]);
    } catch (e: any) {
      setLeadError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (!isAllowed) return null;

  return (
    <div data-equip-chat>
      {/* Floating button */}
      <button
        data-equip-chat-btn
        onClick={() => setOpen((o) => !o)}
        aria-label={
          open ? "Close chat" : "Open chat with EquiProfile assistant"
        }
        title={open ? "Close chat" : "Chat with us"}
      >
        {open ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span data-equip-chat-badge>{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          data-equip-chat-panel
          role="dialog"
          aria-label="EquiProfile chat assistant"
        >
          {/* Header */}
          <div data-equip-chat-header>
            <div data-equip-chat-avatar>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div data-equip-chat-header-info>
              <div data-equip-chat-header-name>EquiProfile Assistant</div>
              <div data-equip-chat-header-status>Online</div>
            </div>
            <button
              data-equip-chat-close
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {step === "lead" ? (
            /* Lead Capture Form – mandatory before chat */
            <div data-equip-chat-lead>
              <div data-equip-lead-title>👋 Welcome to EquiProfile!</div>
              <div data-equip-lead-sub>
                To get started, please share your name and email so we can
                personalise your experience and follow up if needed.
              </div>
              <input
                data-equip-lead-input
                type="text"
                placeholder="Your name"
                value={lead.name}
                onChange={(e) =>
                  setLead((l) => ({ ...l, name: e.target.value }))
                }
                maxLength={100}
                autoFocus
              />
              <input
                data-equip-lead-input
                type="email"
                placeholder="Your email address"
                value={lead.email}
                onChange={(e) =>
                  setLead((l) => ({ ...l, email: e.target.value }))
                }
                maxLength={320}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLeadSubmit();
                }}
              />
              {leadError && <div data-equip-lead-error>{leadError}</div>}
              <button
                data-equip-lead-submit
                onClick={handleLeadSubmit}
                disabled={leadSubmitting}
              >
                {leadSubmitting ? "Starting chat…" : "Start chatting →"}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div data-equip-chat-messages>
                {messages.map((msg) => (
                  <div key={msg.id} data-equip-msg={msg.role}>
                    {msg.role === "assistant" && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1, #06b6d4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          alignSelf: "flex-end",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                    )}
                    <div data-equip-msg-bubble>{msg.content}</div>
                  </div>
                ))}

                {loading && (
                  <div data-equip-msg="assistant">
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div
                      data-equip-msg-bubble
                      style={{
                        background: "#ffffff",
                        border: "1px solid rgba(99,102,241,0.12)",
                      }}
                    >
                      <div data-equip-typing>
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestion chips (show only at start) */}
                {showSuggestions && messages.length === 1 && (
                  <div data-equip-suggestions>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        data-equip-suggestion
                        onClick={() => sendMessage(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Lead CTA (after a few exchanges) */}
                {messages.length >= 5 && !leadDone && step === "chat" && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                    }}
                  >
                    <button
                      data-equip-suggestion
                      onClick={() => setStep("lead")}
                      style={{ fontSize: 12 }}
                    >
                      💬 Talk to a human →
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div data-equip-chat-input-row>
                <textarea
                  ref={textareaRef}
                  data-equip-chat-textarea
                  placeholder="Type a message…"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize
                    e.target.style.height = "auto";
                    e.target.style.height =
                      Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={2000}
                  aria-label="Chat message input"
                />
                <button
                  data-equip-send-btn
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
