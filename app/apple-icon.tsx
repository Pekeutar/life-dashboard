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
            "linear-gradient(135deg, #2d0810 0%, #5a0f1f 50%, #0b0a09 100%)",
          color: "#c5a364",
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
