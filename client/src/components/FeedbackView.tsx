import type { InteractionResult } from "../types";

type FeedbackViewProps = {
  result: InteractionResult;
  onRetry: () => void;
  onContinue: () => void;
  onFinish: () => void;
};

const evaluationCopy = {
  correct: {
    label: "That’s a strong connection",
    tone: "border-moss/25 bg-moss-light",
  },
  partially_correct: {
    label: "You’re partway there",
    tone: "border-amber-200 bg-amber-50",
  },
  incorrect: {
    label: "Let’s take another look",
    tone: "border-sky-200 bg-sky-50",
  },
};

export function FeedbackView({
  result,
  onRetry,
  onContinue,
  onFinish,
}: FeedbackViewProps) {
  const copy = evaluationCopy[result.evaluation];
  const isCorrect = result.evaluation === "correct";

  return (
    <section className="mx-auto max-w-3xl py-10 sm:py-16">
      <p className="eyebrow">Your feedback</p>
      <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-6xl">
        {copy.label}
      </h1>

      <div className={`mt-8 rounded-[2rem] border p-6 sm:p-9 ${copy.tone}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
              {result.evaluation.replace("_", " ")}
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
              Next: {result.nextAction}
            </span>
          </div>
          <span className="text-sm font-semibold text-ink/55">
            Attempt {result.attemptNumber}
          </span>
        </div>

        <p className="mt-7 text-xl leading-9 text-ink">{result.feedback}</p>

        {result.nextAction === "SIMPLIFY" ? (
          <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-ink/70">
            Let&apos;s simplify the next try: focus on the main ingredients,
            process, and outcome rather than trying to say everything at once.
          </div>
        ) : null}

        {result.nextAction === "RETRY" ? (
          <div className="mt-6 rounded-2xl bg-white/70 p-4 text-sm leading-6 text-ink/70">
            Read the explanation once more, then try describing the idea in a
            single clear thought.
          </div>
        ) : null}
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {isCorrect ? (
          <>
            <button className="button-secondary" type="button" onClick={onContinue}>
              Continue Learning
            </button>
            <button className="button-primary" type="button" onClick={onFinish}>
              Finish Session
            </button>
          </>
        ) : (
          <button className="button-primary w-full sm:w-auto" type="button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </section>
  );
}