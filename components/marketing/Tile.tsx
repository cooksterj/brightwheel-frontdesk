export type TileTint =
  | "butter"
  | "clay-soft"
  | "sage"
  | "sand"
  | "dusk-soft"
  | "cream";

export type TileShape =
  | "window"
  | "circle"
  | "sprig"
  | "stones"
  | "moon"
  | "scribble";

export interface TileSpec {
  tint: TileTint;
  w: number;
  h: number;
  top: number;
  left: number;
  rotate: number;
  shape: TileShape;
}

const tintGradient: Record<TileTint, string> = {
  butter: "linear-gradient(160deg, #f6dcab 0%, #e9bd7d 100%)",
  "clay-soft": "linear-gradient(140deg, #f0b89e 0%, #c56541 100%)",
  sage: "linear-gradient(155deg, #b4bfa0 0%, #6e7b5c 100%)",
  sand: "linear-gradient(145deg, #ece0c4 0%, #c4ad82 100%)",
  "dusk-soft": "linear-gradient(160deg, #6a6182 0%, #2b2445 100%)",
  cream: "linear-gradient(150deg, #fbf5e5 0%, #ecdfc5 100%)",
};

export function Tile({ spec }: { spec: TileSpec }) {
  const dark = spec.tint === "dusk-soft";
  const stroke = dark ? "#EFE3C8" : "#231C16";
  return (
    <div
      className="paper-grain h-full w-full overflow-hidden rounded-[3px] shadow-[0_30px_50px_-25px_rgba(0,0,0,0.35)]"
      style={{ background: tintGradient[spec.tint] }}
    >
      <Mark shape={spec.shape} stroke={stroke} />
    </div>
  );
}

function Mark({ shape, stroke }: { shape: TileShape; stroke: string }) {
  const common = {
    fill: "none",
    stroke,
    strokeLinecap: "round" as const,
    strokeWidth: 1.6,
  };
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 z-[1] h-full w-full opacity-45"
      fill="none"
      aria-hidden
    >
      {shape === "window" && (
        <>
          <rect x="38" y="36" width="124" height="128" {...common} />
          <line x1="100" y1="36" x2="100" y2="164" {...common} />
          <line x1="38" y1="100" x2="162" y2="100" {...common} />
        </>
      )}
      {shape === "circle" && (
        <circle cx="100" cy="100" r="46" {...common} strokeWidth={2} />
      )}
      {shape === "sprig" && (
        <>
          <path
            d="M 100 30 C 100 100, 100 140, 100 170"
            {...common}
            strokeWidth={1.8}
          />
          <path d="M 100 70 C 130 60, 150 40, 140 20" {...common} />
          <path d="M 100 100 C 70 90, 50 70, 60 50" {...common} />
          <path d="M 100 130 C 130 120, 150 100, 140 80" {...common} />
        </>
      )}
      {shape === "stones" && (
        <>
          <circle cx="70" cy="80" r="6" fill={stroke} opacity={0.75} />
          <circle cx="120" cy="72" r="7" fill={stroke} opacity={0.75} />
          <circle cx="82" cy="130" r="5" fill={stroke} opacity={0.75} />
          <circle cx="132" cy="122" r="8" fill={stroke} opacity={0.75} />
        </>
      )}
      {shape === "moon" && (
        <path
          d="M 130 40 A 60 60 0 1 0 130 160 A 44 44 0 1 1 130 40 Z"
          fill={stroke}
          opacity={0.55}
        />
      )}
      {shape === "scribble" && (
        <path
          d="M 30 100 C 55 78, 65 124, 90 100 S 120 78, 140 100 S 170 124, 180 100"
          {...common}
          strokeWidth={2.2}
        />
      )}
    </svg>
  );
}
