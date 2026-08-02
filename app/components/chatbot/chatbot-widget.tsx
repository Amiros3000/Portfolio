"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import {
  findBestMatch,
  getEntryById,
  getSuggestedQuestions,
  matchesCounterContext,
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

  // The caller passes a fresh `onDone` closure on every render, and the input
  // this widget owns re-renders the whole panel on each keystroke. Depending on
  // `onDone` here restarted the reveal from zero every time someone typed or
  // deleted a character while a reply was still being revealed. Hold it in a
  // ref so the reveal effect depends only on the text itself.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      i += 1;
      if (i >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onDoneRef.current();
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

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

    // A pending counter-question used to swallow whatever came next, so asking
    // "how do I contact him" right after "why hire Amir" answered the hiring
    // question instead. Only treat the reply as context when it actually names
    // one, or when nothing else matches it.
    if (pendingEntry) {
      const answersCounter = matchesCounterContext(pendingEntry, value);
      const newTopic = findBestMatch(value);

      if (answersCounter || newTopic.id === "fallback") {
        const tailored = resolveCounterAnswer(pendingEntry, value);
        setPendingEntry(null);
        addBotReply(tailored, pendingEntry.followUps);
        return;
      }

      setPendingEntry(null);
      // Fall through and answer the new question instead.
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
      {/*
        No animation library here. Framer Motion is a no-op in this build, and
        because the trigger declared initial={{scale:0, opacity:0}} it shipped
        an invisible, unclickable button to production. These elements are
        visible by default; `.rise` only animates them in when it runs.
      */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          className="rise fixed right-5 bottom-5 z-[60] flex h-12 w-12 cursor-pointer items-center justify-center bg-accent text-on-accent transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Portfolio assistant"
          className="rise fixed right-4 bottom-4 left-4 z-[60] flex max-h-[min(520px,calc(100vh-2rem))] flex-col overflow-hidden border border-line bg-surface sm:right-5 sm:bottom-5 sm:left-auto sm:w-[380px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <p className="font-mono text-[0.7rem] tracking-wide text-accent-ink uppercase">
                Ask about Amir
              </p>
              <p className="mt-0.5 text-[0.7rem] text-muted">
                Background, stack, and projects
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-1 text-muted transition-colors hover:text-foreground"
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
                    className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-on-accent"
                        : "border border-line bg-background text-foreground"
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
                            className="border border-line px-2 py-1 font-mono text-[0.68rem] text-muted transition-colors hover:border-line-strong hover:text-foreground disabled:opacity-50"
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
                    className="border border-line px-2 py-1 font-mono text-[0.68rem] text-muted transition-colors hover:border-line-strong hover:text-foreground"
                  >
                    {entry.question}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-1 border border-line bg-background px-3.5 py-2.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-line px-4 py-3">
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
                className="flex-1 border border-line bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent-ink focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-on-accent transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
