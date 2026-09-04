/**
 * Shared by the launcher and the widget so the button does not visibly change
 * when the real widget takes over.
 *
 * Its own module on purpose: the launcher must not import chatbot-widget (and
 * through it the ~28KB knowledge base), which is the entire point of splitting
 * them. A string constant costs nothing to share; a component would not.
 */
export const LAUNCHER_CLASS =
  "rise fixed right-5 bottom-5 z-[60] flex h-12 w-12 cursor-pointer items-center justify-center bg-accent text-on-accent transition-opacity hover:opacity-90";
