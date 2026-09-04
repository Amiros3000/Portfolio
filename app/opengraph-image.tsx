import { ImageResponse } from "next/og";
import { getPortfolioContent } from "./lib/portfolio-content";
import { fillAuditPlaceholders, footpalReleaseLine } from "./lib/footpal-fc";
import { SITE_DOMAIN } from "./lib/site";

// Everything below is derived. This card used to retype the headline, the
// subheadline, and "v2.43.0 · 457 commits · building since Jun 2026" by hand,
// which made it a fourth independent copy of numbers that were already wrong
// in the other three.
export const alt = fillAuditPlaceholders(
  "Amir Ibrahim — full-stack developer. FootPal FC: {models} Postgres models, {handlers} HTTP handlers, {testBlocks} test blocks.",
);
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the site: bone paper, warm ink, one oxblood rule. No gradient, no
// status dot — the accent appears once, as a rule under the headline.
export default async function Image() {
  const content = await getPortfolioContent();
  const headline = fillAuditPlaceholders(content.hero.headline);
  const subheadline = fillAuditPlaceholders(content.hero.subheadline);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#faf9f7",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            fontSize: "17px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#605a55",
          }}
        >
          Amir Ibrahim / Full-stack developer / GTA, Ontario
        </div>

        <div
          style={{
            width: "64px",
            height: "3px",
            backgroundColor: "#880808",
            marginTop: "34px",
          }}
        />

        <div
          style={{
            fontSize: "58px",
            fontWeight: 700,
            color: "#191614",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginTop: "26px",
            maxWidth: "980px",
          }}
        >
          {headline}
        </div>

        <div
          style={{
            fontSize: "24px",
            color: "#605a55",
            marginTop: "22px",
            maxWidth: "860px",
            lineHeight: 1.45,
          }}
        >
          {subheadline}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #ddd8d1",
            paddingTop: "22px",
          }}
        >
          <span style={{ fontSize: "17px", color: "#605a55" }}>
            {footpalReleaseLine}
          </span>
          <span style={{ fontSize: "17px", color: "#880808" }}>
            {SITE_DOMAIN}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
