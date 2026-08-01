import { ImageResponse } from "next/og";

export const alt =
  "Amir Ibrahim — full-stack developer. FootPal FC: 27 Postgres models, 109 HTTP handlers, 175 test blocks.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirrors the site: bone paper, warm ink, one oxblood rule. No gradient, no
// status dot — the accent appears once, as a rule under the headline.
export default function Image() {
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
          FootPal FC runs on a 27-model Postgres schema, 109 route handlers, and
          175 tests.
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
          Pickup soccer logistics for 25+ players across three crews — RSVPs,
          team drafting, cost splitting, and player ratings.
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
            v2.43.0 · 457 commits · building since Jun 2026
          </span>
          <span style={{ fontSize: "17px", color: "#880808" }}>
            amiribrahim3000.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
