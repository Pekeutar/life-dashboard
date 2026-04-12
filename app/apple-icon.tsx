import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #a855f7 100%)",
          color: "white",
          fontSize: 116,
          fontWeight: 900,
          letterSpacing: -6,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
