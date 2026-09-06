import { useEffect, useMemo, useState } from "react";
import {
  ApiClientError,
  abandonSession,
  createQuestion,
  createSession,
  getHealth,
  getSession,
  submitInteraction,
} from "./lib/api";
import type {
  InteractionResult,
  LearningSession,
} from "./types";
import { ConceptCheck } from "./components/ConceptCheck";
import { ErrorMessage } from "./components/ErrorMessage";
import { ExplanationView } from "./components/ExplanationView";
import { FeedbackView } from "./components/FeedbackView";
import { LoadingState } from "./components/LoadingState";
import { SessionComplete } from "./components/SessionComplete";
import { SkippedView } from "./components/SkippedView";
import { StartLearning } from "./components/StartLearning";

type Stage = "start" | "explanation" | "check" | "feedback" | "skipped" | "complete";
type BusyState =
  | "idle"
  | "starting"
  | "question"
  | "interaction"
  | "abandoning";
type HealthState = "checking" | "online" | "offline";
type CompletionOutcome = "completed" | "skipped";

const SESSION_STORAGE_KEY = "cognibloom.sessionId";

const progressStages = [
  { key: "start", label: "Question" },
  { key: "explanation", label: "Explanation" },
  { key: "check", label: "Check understanding" },
  { key: "complete", label: "Complete" },
];

function getStoredSessionId() {
  const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null;
  }
  return Number(value);
}

function errorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function App() {
  const [stage, setStage] = useState<Stage>("start");
  const [session, setSession] = useState<LearningSession | null>(null);
  const [feedback, setFeedback] = useState<InteractionResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [busy, setBusy] = useState<BusyState>("idle");
  const [booting, setBooting] = useState(true);
  const [health, setHealth] = useState<HealthState>("checking");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [completionOutcome, setCompletionOutcome] =
    useState<CompletionOutcome>("completed");

  const currentProgress = useMemo(() => {
    if (stage === "feedback" || stage === "skipped") {
      return 2;
    }
    if (stage === "complete") {
      return 3;
    }
    return progressStages.findIndex((item) => item.key === stage);
  }, [stage]);

  useEffect(() => {
    let active = true;

    getHealth()
      .then(() => {
        if (active) {
          setHealth("online");
        }
      })
      .catch(() => {
        if (active) {
          setHealth("offline");
        }
      });

    async function restore() {
      const storedSessionId = getStoredSessionId();
      if (!storedSessionId) {
        if (active) {
          setBooting(false);
        }
        return;
      }

      try {
        let restoredSession = await getSession(storedSessionId);
        if (!restoredSession.explanation && restoredSession.question) {
          restoredSession = await createQuestion(
            restoredSession.id,
            restoredSession.question,
          );
        }
        if (!active) {
          return;
        }

        setSession(restoredSession);
        setAttemptNumber(
          Math.max(
            1,
            ...restoredSession.interactions.map(
              (interaction) => interaction.attemptNumber + 1,
            ),
          ),
        );

        if (restoredSession.status === "COMPLETED") {
          setCompletionOutcome("completed");
          setStage("complete");
        } else if (restoredSession.status === "ABANDONED") {
          setCompletionOutcome("skipped");
          setStage("complete");
        } else if (restoredSession.interactions.length > 0) {
          setStage("check");
        } else {
          setStage("explanation");
        }
      } catch (error) {
        if (!active) {
          return;
        }

        if (error instanceof ApiClientError && error.status === 404) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setRestoreError(
            "That saved session is no longer available. Let’s start a new one.",
          );
        } else {
          setRestoreError(errorMessage(error));
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    }

    void restore();

    return () => {
      active = false;
    };
  }, []);

  async function handleStart(topic: string, question: string) {
    setBusy("starting");
    setSubmissionError(null);
    setRestoreError(null);

    try {
      const createdSession = await createSession(topic, question);
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        String(createdSession.id),
      );
      setSession(createdSession);
      setAttemptNumber(1);
      setStage("explanation");

      const explainedSession = await createQuestion(
        createdSession.id,
        question,
      );
      setSession(explainedSession);
    } catch (error) {
      setSubmissionError(errorMessage(error));
    } finally {
      setBusy("idle");
    }
  }

  async function retryQuestion() {
    if (!session) {
      return;
    }

    setBusy("question");
    setSubmissionError(null);

    try {
      const explainedSession = await createQuestion(
        session.id,
        session.question,
      );
      setSession(explainedSession);
    } catch (error) {
      setSubmissionError(errorMessage(error));
    } finally {
      setBusy("idle");
    }
  }

  async function handleSubmitAnswer() {
    if (!session || !answer.trim()) {
      return;
    }

    setBusy("interaction");
    setSubmissionError(null);

    try {
      const result = await submitInteraction(
        session.id,
        answer.trim(),
        attemptNumber,
      );
      setFeedback(result);
      setSession((current) =>
        current
          ? {
              ...current,
              status: result.sessionStatus,
              attemptCount: current.interactions.length + 1,
              interactions: [
                ...current.interactions,
                {
                  id: result.interactionId,
                  sessionId: result.sessionId,
                  interactionType: "SHORT_ANSWER",
                  prompt: current.question,
                  studentResponse: answer.trim(),
                  evaluation: result.evaluation,
                  isCorrect: result.isCorrect,
                  attemptNumber: result.attemptNumber,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : current,
      );
      setStage("feedback");
    } catch (error) {
      setSubmissionError(errorMessage(error));
    } finally {
      setBusy("idle");
    }
  }

  function retryConceptCheck() {
    setAnswer("");
    setAttemptNumber((current) => current + 1);
    setSubmissionError(null);
    setFeedback(null);
    setStage("check");
  }

  function resetToStart() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
    setFeedback(null);
    setAnswer("");
    setAttemptNumber(1);
    setSubmissionError(null);
    setRestoreError(null);
    setCompletionOutcome("completed");
    setStage("start");
  }

  async function finishSession(outcome: CompletionOutcome) {
    if (outcome === "skipped" && session) {
      setBusy("abandoning");
      setSubmissionError(null);

      try {
        const abandonedSession = await abandonSession(session.id);
        setSession(abandonedSession);
        setCompletionOutcome("skipped");
        setStage("complete");
      } catch (error) {
        setSubmissionError(errorMessage(error));
      } finally {
        setBusy("idle");
      }
      return;
    }

    setCompletionOutcome(outcome);
    setStage("complete");
  }

  async function retryRestore() {
    const storedSessionId = getStoredSessionId();
    if (!storedSessionId) {
      resetToStart();
      return;
    }

    setBooting(true);
    setRestoreError(null);

    try {
      let restoredSession = await getSession(storedSessionId);
      if (!restoredSession.explanation && restoredSession.question) {
        restoredSession = await createQuestion(
          restoredSession.id,
          restoredSession.question,
        );
      }
      setSession(restoredSession);
      setAttemptNumber(
        Math.max(
          1,
          ...restoredSession.interactions.map(
            (interaction) => interaction.attemptNumber + 1,
          ),
        ),
      );
      setStage(
        restoredSession.status === "COMPLETED"
          ? "complete"
          : restoredSession.status === "ABANDONED"
            ? "complete"
          : restoredSession.interactions.length > 0
            ? "check"
            : "explanation",
      );
      setCompletionOutcome(
        restoredSession.status === "ABANDONED" ? "skipped" : "completed",
      );
    } catch (error) {
      setRestoreError(errorMessage(error));
    } finally {
      setBooting(false);
    }
  }

  const healthLabel = {
    checking: "Checking connection",
    online: "Backend connected",
    offline: "Backend unavailable",
  }[health];

  return (
    <main className="min-h-screen bg-cream px-5 py-6 text-ink sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <button
            className="flex items-center gap-3 text-left"
            type="button"
            onClick={resetToStart}
            aria-label="Start a new CogniBloom session"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-moss text-lg font-bold text-white shadow-sm">
              C
            </span>
            <span>
              <span className="block font-semibold tracking-tight">CogniBloom</span>
              <span className="hidden text-xs text-ink/45 sm:block">
                Active learning tutor
              </span>
            </span>
          </button>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              health === "online"
                ? "border-moss/20 bg-moss-light text-moss"
                : health === "offline"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <span className="mr-1.5">●</span>
            {healthLabel}
          </span>
        </header>

        {stage !== "start" && !booting ? (
          <nav
            className="mx-auto mt-10 flex w-full max-w-3xl items-center justify-between gap-2"
            aria-label="Learning progress"
          >
            {progressStages.map((item, index) => {
              const complete = index < currentProgress;
              const active = index === currentProgress;
              return (
                <div className="flex flex-1 items-center gap-2" key={item.key}>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      complete || active
                        ? "bg-moss text-white"
                        : "border border-ink/15 text-ink/35"
                    }`}
                    aria-current={active ? "step" : undefined}
                  >
                    {complete ? "✓" : index + 1}
                  </div>
                  <span
                    className={`hidden text-xs font-semibold sm:block ${
                      active ? "text-ink" : "text-ink/40"
                    }`}
                  >
                    {item.label}
                  </span>
                  {index < progressStages.length - 1 ? (
                    <span
                      className={`ml-auto h-px flex-1 ${
                        complete ? "bg-moss/50" : "bg-ink/10"
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </nav>
        ) : null}

        <div className="flex-1">
          {booting ? (
            <LoadingState />
          ) : stage === "start" ? (
            <StartLearning
              onSubmit={handleStart}
              busy={busy === "starting"}
              error={submissionError ?? restoreError}
              backendOffline={health === "offline"}
              onRetry={restoreError ? retryRestore : undefined}
            />
          ) : session ? (
            <>
              {stage === "explanation" ? (
                <ExplanationView
                  session={session}
                  loading={busy === "question"}
                  error={submissionError}
                  onContinue={() => {
                    setSubmissionError(null);
                    setStage("check");
                  }}
                  onRetry={retryQuestion}
                />
              ) : null}

              {stage === "check" ? (
                <ConceptCheck
                  session={session}
                  attemptNumber={attemptNumber}
                  answer={answer}
                  busy={busy === "interaction"}
                  error={submissionError}
                  onAnswerChange={setAnswer}
                  onSubmit={handleSubmitAnswer}
                  onSkip={() => {
                    setSubmissionError(null);
                    setStage("skipped");
                  }}
                />
              ) : null}

              {stage === "feedback" && feedback ? (
                <FeedbackView
                  result={feedback}
                  onRetry={retryConceptCheck}
                  onContinue={resetToStart}
                  onFinish={() => finishSession("completed")}
                />
              ) : null}

              {stage === "skipped" ? (
                <SkippedView
                  attemptCount={session.attemptCount}
                  busy={busy === "abandoning"}
                  error={submissionError}
                  onContinue={() => setStage("check")}
                  onFinish={() => void finishSession("skipped")}
                  onRetry={() => void finishSession("skipped")}
                />
              ) : null}

              {stage === "complete" ? (
                <SessionComplete
                  topic={session.topic}
                  attemptCount={session.attemptCount}
                  outcome={completionOutcome}
                  onStartOver={resetToStart}
                />
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl py-20">
              <ErrorMessage
                message="We couldn't load this learning session."
                onRetry={resetToStart}
              />
            </div>
          )}
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-ink/10 pt-5 text-sm text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <span>CogniBloom · Learn by doing</span>
          <span>One question. One concept check. A deeper understanding.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;