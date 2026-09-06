import { FormEvent, useState } from "react";
import { ErrorMessage } from "./ErrorMessage";

type StartLearningProps = {
  onSubmit: (topic: string, question: string) => void;
  busy: boolean;
  error: string | null;
  backendOffline: boolean;
  onRetry?: () => void;
};

export function StartLearning({
  onSubmit,
  busy,
  error,
  backendOffline,
  onRetry,
}: StartLearningProps) {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [touched, setTouched] = useState({
    topic: false,
    question: false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ topic: true, question: true });

    if (!topic.trim() || !question.trim()) {
      return;
    }

    onSubmit(topic.trim(), question.trim());
  }

  const topicError =
    touched.topic && !topic.trim() ? "Add a topic to get started." : null;
  const questionError =
    touched.question && !question.trim()
      ? "Add a question you want to understand."
      : null;

  return (
    <section className="grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
      <div>
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-moss">
          Active learning tutor
        </p>
        <h1 className="max-w-2xl font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
          Learn by thinking it through.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-ink/65">
          CogniBloom turns a good explanation into a moment of practice, so
          you leave with understanding—not just an answer.
        </p>

        <div className="mt-10 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          <span className="rounded-full bg-moss-light px-3 py-2">Ask</span>
          <span className="pt-2 text-moss">→</span>
          <span className="rounded-full bg-moss-light px-3 py-2">Explain</span>
          <span className="pt-2 text-moss">→</span>
          <span className="rounded-full bg-moss-light px-3 py-2">Practice</span>
        </div>
      </div>

      <form
        className="rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(82,114,96,0.12)] sm:p-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="mb-8">
          <p className="text-sm font-medium text-ink/50">Start a session</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            What are you curious about?
          </h2>
        </div>

        {backendOffline ? (
          <div className="mb-5">
            <ErrorMessage
              compact
              message="The learning backend is offline. You can still prepare your question, then try again when it is available."
            />
          </div>
        ) : null}

        {error ? (
          <div className="mb-5">
            <ErrorMessage compact message={error} onRetry={onRetry} />
          </div>
        ) : null}

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Topic</span>
            <input
              className={`field ${topicError ? "field-error" : ""}`}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              onBlur={() => setTouched((current) => ({ ...current, topic: true }))}
              placeholder="e.g. Photosynthesis"
              aria-invalid={Boolean(topicError)}
              aria-describedby={topicError ? "topic-error" : undefined}
              disabled={busy}
            />
            {topicError ? (
              <span id="topic-error" className="field-message">
                {topicError}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Question</span>
            <textarea
              className={`field min-h-28 resize-y ${questionError ? "field-error" : ""}`}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({ ...current, question: true }))
              }
              placeholder="What is photosynthesis?"
              aria-invalid={Boolean(questionError)}
              aria-describedby={questionError ? "question-error" : undefined}
              disabled={busy}
            />
            {questionError ? (
              <span id="question-error" className="field-message">
                {questionError}
              </span>
            ) : null}
          </label>
        </div>

        <button className="button-primary mt-7 w-full" type="submit" disabled={busy}>
          {busy ? "Preparing your lesson…" : "Start Learning"}
        </button>
        <p className="mt-4 text-center text-xs leading-5 text-ink/45">
          You’ll get an explanation, then a chance to put it in your own words.
        </p>
      </form>
    </section>
  );
}