export function UnderlineScribble({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M 4 14 C 40 6, 86 20, 132 12 S 220 4, 260 11 S 300 18, 316 10"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
