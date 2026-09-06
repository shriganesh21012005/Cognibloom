import { ErrorMessage } from "./ErrorMessage";

type SkippedViewProps = {
  attemptCount: number;
  busy: boolean;
  error: string | null;
  onContinue: () => void;
  onFinish: () => void;
  onRetry: () => void;
};

export function SkippedView({
  attemptCount,
  busy,
  error,
  onContinue,
  onFinish,
  onRetry,
}: SkippedViewProps) {
  return (
    <section className="mx-auto max-w-2xl py-16 text-center sm:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl text-amber-700">
        …
      </div>
      <p className="eyebrow mt-7">Concept check skipped</p>
      <h1 className="mt-3 font-display text-5xl leading-tight tracking-tight">
        You can come back to this.
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-ink/60">
        Skipping doesn&apos;t count as understanding yet. Continue when you&apos;re
        ready, or finish with this session marked as incomplete.
      </p>
      <p className="mt-5 text-sm font-medium text-ink/45">
        {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"} recorded
      </p>
      {error ? (
        <div className="mx-auto mt-6 max-w-lg text-left">
          <ErrorMessage compact message={error} onRetry={onRetry} />
        </div>
      ) : null}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          className="button-secondary"
          type="button"
          onClick={onContinue}
          disabled={busy}
        >
          Return to concept check
        </button>
        <button
          className="button-primary"
          type="button"
          onClick={onFinish}
          disabled={busy}
        >
          {busy ? "Finishing Session…" : "Finish Session"}
        </button>
      </div>
    </section>
  );
}