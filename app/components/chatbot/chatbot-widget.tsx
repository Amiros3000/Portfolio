"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import {
  findBestMatch,
  getEntryById,
  getSuggestedQuestions,
  resolveCounterAnswer,
  type KnowledgeEntry,
} from "./chatbot-knowledge-base";

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
  followUps?: string[];
};

function TypingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx.current += 1;
      if (idx.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onDone();
      } else {
        setDisplayed(text.slice(0, idx.current));
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

let nextId = 1;

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingDone, setTypingDone] = useState<Set<number>>(new Set());
  // Track when the bot asked a counter-question, waiting for context
  const [pendingEntry, setPendingEntry] = useState<KnowledgeEntry | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        id: nextId++,
        role: "bot",
        text: "Hey! I\u2019m Amir\u2019s portfolio assistant. Ask me anything about his background, skills, projects, or why he\u2019d be a great addition to your team!",
        followUps: ["background", "fit", "skills", "projects"],
      };
      setMessages([greeting]);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function addBotReply(text: string, followUps?: string[]) {
    setIsTyping(true);
    const delay = 400 + Math.random() * 400;
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: nextId++,
        role: "bot",
        text,
        followUps,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  }

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value || isTyping) return;

    const userMsg: ChatMessage = {
      id: nextId++,
      role: "user",
      text: value,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // If there's a pending counter-question, resolve with the user's context
    if (pendingEntry) {
      const tailored = resolveCounterAnswer(pendingEntry, value);
      setPendingEntry(null);
      addBotReply(tailored, pendingEntry.followUps);
      return;
    }

    const match = findBestMatch(value);

    // If this entry has a counter-question, ask it first instead of answering
    if (match.counterQuestion) {
      setPendingEntry(match);
      addBotReply(match.counterQuestion);
      return;
    }

    addBotReply(match.answer, match.followUps);
  }

  function handleSuggestion(entryId: string) {
    if (isTyping) return;
    const entry = getEntryById(entryId);
    if (!entry) return;

    // Clear any pending counter-question when using suggestion chips
    setPendingEntry(null);

    const userMsg: ChatMessage = {
      id: nextId++,
      role: "user",
      text: entry.question,
    };
    setMessages((prev) => [...prev, userMsg]);

    if (entry.counterQuestion) {
      setPendingEntry(entry);
      addBotReply(entry.counterQuestion);
      return;
    }

    addBotReply(entry.answer, entry.followUps);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const handleTypingDone = useCallback((msgId: number) => {
    setTypingDone((prev) => new Set(prev).add(msgId));
  }, []);

  const suggestions = getSuggestedQuestions();

  return (
    <>
      {/* Floating bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
            className="accent-glow fixed right-6 bottom-6 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-105 active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 bottom-4 left-4 z-[60] flex max-h-[min(520px,calc(100vh-2rem))] flex-col overflow-hidden rounded-3xl border border-accent/20 bg-surface/90 shadow-[0_24px_60px_-20px_var(--shadow-accent)] backdrop-blur-xl sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line/60 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                  <MessageCircle className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ask me anything
                  </p>
                  <p className="text-[11px] text-muted">
                    About Amir&apos;s background
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-full p-1.5 text-muted transition hover:bg-surface/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-accent text-white"
                          : "border border-line/60 bg-surface/70 text-foreground"
                      }`}
                    >
                      {msg.role === "bot" && !typingDone.has(msg.id) ? (
                        <TypingText
                          text={msg.text}
                          onDone={() => handleTypingDone(msg.id)}
                        />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>

                  {/* Follow-up chips */}
                  {msg.role === "bot" &&
                    msg.followUps &&
                    typingDone.has(msg.id) && (
                      <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                        {msg.followUps.map((fId) => {
                          const entry = getEntryById(fId);
                          if (!entry) return null;
                          return (
                            <button
                              key={fId}
                              onClick={() => handleSuggestion(fId)}
                              disabled={isTyping}
                              className="rounded-full border border-secondary/25 bg-secondary/8 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-secondary/15 disabled:opacity-50"
                            >
                              {entry.question}
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
              ))}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleSuggestion(entry.id)}
                      className="rounded-full border border-secondary/25 bg-secondary/8 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-secondary/15"
                    >
                      {entry.question}
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl border border-line/60 bg-surface/70 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-line/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pendingEntry
                      ? "Tell me about your team..."
                      : "Ask about Amir..."
                  }
                  className="flex-1 rounded-xl border border-accent/20 bg-surface/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 backdrop-blur-md transition focus:border-accent/40 focus:outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-accent/90 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
