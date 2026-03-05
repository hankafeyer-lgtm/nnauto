interface PhotoWatermarkProps {
  className?: string;
  compact?: boolean;
}

export default function PhotoWatermark({
  className = "",
  compact = false,
}: PhotoWatermarkProps) {
  return (
    <div
      className={`pointer-events-none absolute z-20 select-none ${compact ? "px-1.5 py-1" : "px-2 py-1.5"} ${className}`}
      aria-hidden="true"
    >
      <span className="inline-flex items-baseline leading-none">
        <span
          className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} font-extrabold tracking-[0.05em] bg-gradient-to-r from-[#f8db78] via-[#d4af37] to-[#b8860b] bg-clip-text text-transparent`}
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
        >
          NN
        </span>
        <span
          className={`${compact ? "text-[10px]" : "text-xs sm:text-sm"} -ml-[1px] font-semibold tracking-[0.03em] text-white/85`}
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.55)" }}
        >
          Auto.cz
        </span>
      </span>
    </div>
  );
}
