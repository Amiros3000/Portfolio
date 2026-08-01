import type { Config } from "tailwindcss";

// Colors are defined once, as CSS custom properties in app/globals.css and
// exposed through `@theme inline`. Do not redeclare them here — a hardcoded
// value in this file shadows the token and silently breaks theming.
const config: Config = {
  darkMode: "class",
};

export default config;
