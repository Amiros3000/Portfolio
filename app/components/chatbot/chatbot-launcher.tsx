"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";
import { LAUNCHER_CLASS } from "./launcher-style";

/**
 * Defers the chat widget until someone asks for it.
 *
 * ChatbotWidget pulls in chatbot-knowledge-base.ts, ~28KB of source before
 * minification. It was mounted in the root layout, so every visitor downloaded
 * and parsed all of it on first paint whether or not they ever opened the chat,
 * on a page whose entire content is already server-rendered above it.
 *
 * `ssr: false` because the launcher is a fixed-position button with no server
 * markup worth producing, and the widget reads `window` on mount.
 */
const ChatbotWidget = dynamic(() => import("./chatbot-widget"), { ssr: false });

export default function ChatbotLauncher() {
  const [mounted, setMounted] = useState(false);

  // Warm the chunk once the page is idle, so the click that opens the chat
  // does not also pay for the download. Falls back to a short timer where
  // requestIdleCallback is unavailable (Safari). Cancelled on unmount so a
  // fast navigation away does not leave a pending fetch.
  useEffect(() => {
    if (mounted) return;

    const preload = () => {
      void import("./chatbot-widget");
    };

    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(preload, { timeout: 4000 });
      return () => window.cancelIdleCallback(handle);
    }

    const handle = window.setTimeout(preload, 2500);
    return () => window.clearTimeout(handle);
  }, [mounted]);

  // Once the widget is mounted it owns open/closed, including drawing this same
  // button when closed. Rendering both would stack two buttons in one corner.
  if (mounted) return <ChatbotWidget initialOpen />;

  return (
    <button
      type="button"
      onClick={() => setMounted(true)}
      aria-label="Open chat"
      className={LAUNCHER_CLASS}
    >
      <MessageCircle className="h-5 w-5" />
    </button>
  );
}
