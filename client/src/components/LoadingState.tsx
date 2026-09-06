type LoadingStateProps = {
  label?: string;
  compact?: boolean;
};

export function LoadingState({
  label = "Loading your learning space…",
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center gap-3 text-sm text-ink/60 ${
        compact ? "py-2" : "min-h-[18rem] justify-center"
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="h-3 w-3 animate-pulse rounded-full bg-moss" />
      <span>{label}</span>
    </div>
  );
}