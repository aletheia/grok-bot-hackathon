import { ImageResponse } from "next/og";
import { EVENT, formatDateRange } from "@/lib/event";

export const alt = `${EVENT.name} — ${EVENT.venue.name}, ${EVENT.venue.address.locality}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Blob({ color, w, h, radius, style }: { color: string; w: number; h: number; radius: string; style: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        width: w,
        height: h,
        background: color,
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: w * 0.14,
        ...style,
      }}
    >
      <div style={{ width: w * 0.1, height: h * 0.24, background: "#0a0a0a", borderRadius: 999 }} />
      <div style={{ width: w * 0.1, height: h * 0.24, background: "#0a0a0a", borderRadius: 999 }} />
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        <Blob color="#ff3fa4" w={150} h={140} radius="50% 50% 40% 40% / 70% 70% 30% 30%" style={{ top: 50, right: 330, transform: "rotate(-12deg)" }} />
        <Blob color="#ff8c1a" w={140} h={160} radius="50% 50% 50% 50% / 30% 30% 70% 70%" style={{ top: 70, right: 110 }} />
        <Blob color="#17b8a6" w={150} h={130} radius="40%" style={{ bottom: 60, right: 380 }} />
        <Blob color="#2f80ff" w={220} h={170} radius="55% 45% 40% 50%" style={{ bottom: 40, right: 80 }} />

        <div style={{ display: "flex", fontSize: 30, color: "#ff8c1a", fontWeight: 700, letterSpacing: 2 }}>
          {formatDateRange().toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 18, fontSize: 104, fontWeight: 900, color: "#ffffff", lineHeight: 0.95 }}>
          <span>GROK</span>
          <span>HACKATHON</span>
        </div>
        <div style={{ display: "flex", fontSize: 44, color: "#17b8a6", marginTop: 16, fontWeight: 700 }}>at the Museum</div>
        <div style={{ display: "flex", fontSize: 28, color: "#d4d4d4", marginTop: 34 }}>
          {`${EVENT.venue.name} · ${EVENT.venue.address.locality}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
