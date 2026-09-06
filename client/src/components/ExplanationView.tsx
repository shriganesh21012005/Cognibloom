import type { LearningSession } from "../types";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingState } from "./LoadingState";

type ExplanationViewProps = {
  session: LearningSession;
  loading: boolean;
  error: string | null;
  onContinue: () => void;
  onRetry: () => void;
};

export function ExplanationView({
  session,
  loading,
  error,
  onContinue,
  onRetry,
}: ExplanationViewProps) {
  return (
    <section className="mx-auto max-w-3xl py-10 sm:py-16">
      <div className="mb-8">
        <p className="eyebrow">Your question</p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-6xl">
          {session.question}
        </h1>
        <p className="mt-4 text-sm font-medium text-moss">{session.topic}</p>
      </div>

      <div className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(82,114,96,0.1)] sm:p-9">
        <div className="flex items-center justify-between border-b border-ink/10 pb-5">
          <div>
            <p className="eyebrow">The explanation</p>
            <h2 className="mt-2 text-2xl font-semibold">Build the picture</h2>
          </div>
          <span className="rounded-full bg-moss-light px-3 py-1.5 text-xs font-semibold text-moss">
            Step 2 of 4
          </span>
        </div>

        {loading ? (
          <LoadingState label="Finding a clear explanation…" />
        ) : error ? (
          <div className="py-8">
            <ErrorMessage message={error} onRetry={onRetry} />
          </div>
        ) : (
          <>
            <p className="mt-7 text-lg leading-8 text-ink/75">
              {session.explanation}
            </p>
            <div className="mt-9 rounded-2xl bg-cream p-5">
              <p className="text-sm font-semibold text-moss">
                Now let&apos;s check your understanding.
              </p>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                A short response will help turn this explanation into
                something you can use.
              </p>
            </div>
            <button className="button-primary mt-7 w-full sm:w-auto" type="button" onClick={onContinue}>
              Check my understanding
            </button>
          </>
        )}
      </div>
    </section>
  );
}