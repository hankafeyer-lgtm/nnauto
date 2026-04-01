export function PhotoWatermark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 ${className}`}
    >
      <span className="text-white/25 text-3xl sm:text-4xl lg:text-3xl font-bold tracking-wider rotate-[-20deg] whitespace-nowrap">
        NNAuto.cz
      </span>
    </div>
  );
}
