import { FormEvent } from "react";
import type { LearningSession } from "../types";
import { ErrorMessage } from "./ErrorMessage";

type ConceptCheckProps = {
  session: LearningSession;
  attemptNumber: number;
  answer: string;
  busy: boolean;
  error: string | null;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
};

export function ConceptCheck({
  session,
  attemptNumber,
  answer,
  busy,
  error,
  onAnswerChange,
  onSubmit,
  onSkip,
}: ConceptCheckProps) {
  const challenge = session.topic.toLowerCase().includes("photosynthesis")
    ? "Explain in your own words what photosynthesis is and what plants need for it."
    : `Explain in your own words what ${session.topic} means and what matters most about it.`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!answer.trim() || busy) {
      return;
    }
    onSubmit();
  }

  return (
    <section className="mx-auto max-w-3xl py-10 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Check understanding</p>
          <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            Your turn to explain it.
          </h1>
        </div>
        <span className="w-fit rounded-full bg-moss-light px-3 py-1.5 text-xs font-semibold text-moss">
          Attempt {attemptNumber}
        </span>
      </div>

      <form
        className="rounded-[2rem] border-2 border-moss/30 bg-white p-6 shadow-[0_20px_60px_rgba(82,114,96,0.14)] sm:p-9"
        onSubmit={handleSubmit}
      >
        <div className="rounded-2xl bg-moss-light/70 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
            Concept check
          </p>
          <p className="mt-3 text-xl font-medium leading-8 text-ink">
            {challenge}
          </p>
        </div>

        <label className="mt-7 block">
          <span className="mb-2 block text-sm font-semibold">
            Your explanation
          </span>
          <textarea
            className="field min-h-44 resize-y"
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            placeholder="Take a moment. What would you tell a friend who asked?"
            disabled={busy}
            aria-describedby="answer-help"
          />
          <span id="answer-help" className="mt-2 block text-xs leading-5 text-ink/45">
            There’s no need to use perfect words. Show what you understand.
          </span>
        </label>

        {error ? (
          <div className="mt-5">
            <ErrorMessage compact message={error} />
          </div>
        ) : null}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="button-secondary"
            type="button"
            onClick={onSkip}
            disabled={busy}
          >
            Skip for now
          </button>
          <button
            className="button-primary"
            type="submit"
            disabled={busy || !answer.trim()}
          >
            {busy
              ? "Checking your answer…"
              : error
                ? "Retry Answer"
                : "Submit Answer"}
          </button>
        </div>
      </form>
    </section>
  );
}