import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 96,
          color: "white",
          fontSize: 320,
          fontWeight: 900,
          letterSpacing: -16,
        }}
      >
        L
      </div>
    ),
    { ...size }
  );
}
