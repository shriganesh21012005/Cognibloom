type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorMessage({
  message,
  onRetry,
  compact = false,
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800 ${
        compact ? "p-3" : "p-4"
      }`}
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          className="mt-3 font-semibold text-red-900 underline underline-offset-4 hover:no-underline"
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}