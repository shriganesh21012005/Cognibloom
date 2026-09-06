type SessionCompleteProps = {
  topic: string;
  attemptCount: number;
  outcome: "completed" | "skipped";
  onStartOver: () => void;
};

export function SessionComplete({
  topic,
  attemptCount,
  outcome,
  onStartOver,
}: SessionCompleteProps) {
  const completed = outcome === "completed";

  return (
    <section className="mx-auto max-w-2xl py-16 text-center sm:py-24">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-2xl ${
          completed ? "bg-moss text-white" : "bg-amber-100 text-amber-700"
        }`}
      >
        {completed ? "✓" : "—"}
      </div>
      <p className="eyebrow mt-7">{completed ? "Session complete" : "Session finished"}</p>
      <h1 className="mt-3 font-display text-5xl leading-tight tracking-tight">
        {completed ? "You made the idea yours." : "You can return when ready."}
      </h1>
      <p className="mt-5 text-lg leading-8 text-ink/60">
        {completed
          ? `Your concept check for ${topic} is complete.`
          : `Your ${topic} session ended before the concept check was completed.`}
      </p>

      <div className="mx-auto mt-9 grid max-w-sm grid-cols-2 divide-x divide-ink/10 rounded-2xl border border-ink/10 bg-white/70 p-5">
        <div>
          <p className="text-3xl font-semibold">{attemptCount}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">
            {attemptCount === 1 ? "attempt" : "attempts"}
          </p>
        </div>
        <div>
          <p className="text-3xl font-semibold">{completed ? "Done" : "Open"}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink/45">
            outcome
          </p>
        </div>
      </div>

      <button className="button-primary mt-9" type="button" onClick={onStartOver}>
        Start a new session
      </button>
    </section>
  );
}