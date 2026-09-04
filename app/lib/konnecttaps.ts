/**
 * KonnectTaps — decision entries.
 *
 * Same shape and same rules as footpal-fc.ts: the title leads with what was
 * built, the tradeoff states what the choice cost. Nothing here may be softened
 * into a claim the code does not support.
 *
 * Sourced from a code review of KonnectTaps/Frontend dated 2026-09-04, reading
 * the implementation and git history (commits 4666d44, 9ba6afe, d039aba,
 * 3656275). Two claims were corrected against that review and must not drift
 * back:
 *
 *  - The tour's dynamic repositioning around floating controls is NOT claimed.
 *    That code exists but is unreachable: every mobile step hardcodes
 *    placement:'top', which returns early before the overlap logic runs. Only
 *    the z-index work actually ships.
 *  - The QR centering fallback is claimed for the CREATION path only. The
 *    render path falls back to zero, which pins to the corner, not the centre.
 *
 * The tradeoff lines name the structural cost of each approach. Several of
 * those costs have produced real defects in the shipped product; those specifics
 * are interview material rather than page copy, and the page does not pretend
 * the costs were hypothetical.
 */
import type { Decision } from "./footpal-fc";

export const konnectTapsDecisions: Decision[] = [
  {
    title: "In-app navigation guard replacing the browser's confirm dialog",
    body: "A styled modal was a product requirement that window.confirm cannot satisfy. While the card editor holds unsaved edits it intercepts every navigation React can see — anchor clicks in the capture phase, patched history.pushState and replaceState, and popstate — and routes each one through that modal. Other navigation components ask permission first through a small protocol published on window.",
    tradeoff:
      "That protocol is three magic strings on window: no import, no type, one slot. A navigation surface that does not know to call it bypasses the guard with no compile-time signal, and a skip flag set by one component but never consumed survives into the next mount. beforeunload still raises the browser's own dialog, so closing the tab gets a different prompt than clicking a link.",
  },
  {
    title: "QR geometry guarded at the render site rather than in the templates",
    body: "QR codes were vanishing because NaN was reaching an SVG transform. The templates were not the source: template parsing already funnels every attribute through a finite-or-fallback helper. The bad values came from card records persisted before those geometry fields existed, loaded back into state without reparsing — so correcting the source SVGs would have repaired nothing already in the database or in a user's browser. Every term is now guarded where it is used, with a centering fallback on the card-creation path.",
    tradeoff:
      "Guarding where a value is used rather than where it enters means every renderer needs its own guard, and a second copy of the pipeline behind card ordering never got one. Normalizing once at the data boundary would have covered both by construction. The fallback is also recomputed on each render and never written back, so the incomplete records stay incomplete.",
  },
  {
    title: "Onboarding tour built in-house instead of taken as a dependency",
    body: "Five steps, a fixed popover, and an explicit z-index ladder that drops the mobile action bar beneath the overlay while the tour runs. This fixed the inherited flow's real bug, where highlighted controls sat under the overlay and could not be clicked: targets are raised above it instead.",
    tradeoff:
      "Raising the target above the overlay means it has to be made inert to stay non-interactive, so a highlighted control can never itself be clickable. That forecloses the step that waits for the user to perform the real action, which is the format libraries exist to provide via a cutout. Targets also resolve by global string selector, so a duplicated attribute resolves to whichever element renders first, and the overlay declares a modal role without implementing a focus trap.",
  },
];

/**
 * When the code above was read. Stated on the page for the same reason the
 * FootPal audit date is: a claim about a codebase is only as good as the date
 * someone last checked it against the code.
 */
export const KONNECTTAPS_REVIEW_DATE = "September 4, 2026";
