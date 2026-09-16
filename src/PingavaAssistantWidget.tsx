import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
import { BrandMark } from "./Brand";
import "./PingavaAssistantWidget.css";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "⚡ How does uptime monitoring work?",
  "📊 How do I create a public status page?",
  "🔒 How do SSL certificate alerts work?",
  "💰 What are the pricing plans & limits?",
  "🌍 Which global regions check my site?",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function PingavaAssistantWidget() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "**Hello! Welcome to Pingava.** 👋\n\nI'm your product guide. Ask me anything about our synthetic uptime monitoring, multi-region checks, SSL certificates, or status pages!",
      timestamp: formatTime(new Date()),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Gradual entrance: Icon appears smoothly ~1.2s after the page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll messages feed to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/public/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantReply: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Thank you for reaching out to Pingava!",
        timestamp: formatTime(new Date()),
      };

      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: any) {
      const fallbackReply: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: "assistant",
        content:
          "Pingava is an enterprise synthetic monitoring platform. You can monitor web apps, APIs, and SSL certificates across 6 global regions.\n\n" +
          "Visit [pingava.com/pricing](https://www.pingava.com/pricing) or [pingava.com/docs](https://www.pingava.com/docs) for more details!",
        timestamp: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Safe markdown text formatter
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="pingava-formatted-content">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: "6px" }} />;

          // Bullet points
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const itemText = trimmed.substring(2);
            return (
              <li key={idx} style={{ marginLeft: "14px", marginBottom: "3px" }}>
                {renderInlineTokens(itemText)}
              </li>
            );
          }

          // Numbered lists
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} style={{ marginLeft: "6px", marginBottom: "3px" }}>
                <strong>{numMatch[1]}.</strong> {renderInlineTokens(numMatch[2])}
              </div>
            );
          }

          return (
            <p key={idx} style={{ margin: "0 0 6px 0" }}>
              {renderInlineTokens(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineTokens = (text: string) => {
    // Parse bold **text** and markdown links [text](url)
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  if (!isMounted) return null;

  return (
    <div className="pingava-assistant-wrapper pingava-assistant-gradual-enter">
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className="pingava-assistant-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Pingava Assistant" : "Open Pingava Assistant"}
        title={isOpen ? "Close chat" : "Questions? Chat with Pingava"}
      >
        {isOpen ? (
          <div className="pingava-fab-close-icon">
            <X size={26} strokeWidth={2.4} />
          </div>
        ) : (
          <>
            <div className="pingava-fab-logo-disc">
              <BrandMark variant="color" />
            </div>
            <span className="pingava-fab-status-badge" aria-label="Online" />
          </>
        )}
      </button>

      {!isOpen && (
        <div className="pingava-assistant-tooltip">
          Questions? Chat with Pingava
        </div>
      )}

      {/* Expandable Chat Modal */}
      {isOpen && (
        <div className="pingava-chat-window" role="dialog" aria-modal="true" aria-label="Pingava Product Assistant">
          {/* Header */}
          <div className="pingava-chat-header">
            <div className="pingava-chat-header-main">
              <div className="pingava-chat-avatar">
                <BrandMark variant="color" />
              </div>
              <div className="pingava-chat-titles">
                <span className="pingava-chat-title">Questions? Chat with us.</span>
                <span className="pingava-chat-subtitle">
                  <span className="pingava-online-dot" /> Typically replies instantly
                </span>
              </div>
            </div>
            <button
              type="button"
              className="pingava-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Security & Product Guide Subtitle Banner */}
          <div className="pingava-chat-banner">
            <ShieldCheck size={14} className="pingava-chat-banner-icon" />
            <span>Official Product &amp; Reliability Guide</span>
          </div>

          {/* Messages Feed */}
          <div className="pingava-chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`pingava-msg-row ${
                  msg.role === "user" ? "pingava-msg-user" : "pingava-msg-assistant"
                }`}
              >
                <div className="pingava-msg-bubble">
                  {renderFormattedContent(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="pingava-msg-row pingava-msg-assistant">
                <div className="pingava-msg-bubble">
                  <div className="pingava-typing-indicator">
                    <span className="pingava-typing-dot" />
                    <span className="pingava-typing-dot" />
                    <span className="pingava-typing-dot" />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestion Chips (shown after the welcome message) */}
            {messages.length === 1 && !isLoading && (
              <div className="pingava-quick-suggestions">
                <div className="pingava-quick-label">Suggested Questions</div>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    className="pingava-pill-btn"
                    onClick={() => handleSendMessage(prompt)}
                  >
                    <span>{prompt}</span>
                    <ChevronRight size={14} opacity={0.7} />
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="pingava-chat-input-area">
            <div className="pingava-input-row">
              <input
                ref={inputRef}
                type="text"
                className="pingava-input-field"
                placeholder="Ask about Pingava features..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="button"
                className="pingava-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="pingava-input-disclaimer">
              Answers product &amp; monitoring capability questions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
