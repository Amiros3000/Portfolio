import { ImageResponse } from "next/og";

export const alt = "Amir Ibrahim — Computer Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          backgroundColor: "#050505",
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(136,8,8,0.25) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
            }}
          />
          <span style={{ fontSize: "18px", color: "#86efac" }}>
            Open to opportunities
          </span>
        </div>

        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#f5f5f5",
            lineHeight: 1.1,
          }}
        >
          Amir Ibrahim
        </div>

        <div
          style={{
            fontSize: "30px",
            color: "#a3a3a3",
            marginTop: "12px",
          }}
        >
          Computer Engineer
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "#737373",
            marginTop: "20px",
            maxWidth: "780px",
            lineHeight: 1.5,
          }}
        >
          I build scalable systems that stay reliable when real-world pressure
          hits.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "50px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "16px", color: "#525252" }}>
              github.com/Amiros3000
            </span>
            <span style={{ fontSize: "16px", color: "#880808" }}>|</span>
            <span style={{ fontSize: "16px", color: "#525252" }}>
              linkedin.com/in/amir3000
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            {["Java", "Node.js", "Python", "MySQL", "Docker"].map((skill) => (
              <span
                key={skill}
                style={{
                  fontSize: "13px",
                  color: "#a3a3a3",
                  border: "1px solid rgba(136,8,8,0.3)",
                  borderRadius: "9999px",
                  padding: "4px 12px",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
