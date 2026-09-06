export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type Evaluation =
  | "correct"
  | "partially_correct"
  | "incorrect";

export type NextAction = "COMPLETE" | "RETRY" | "SIMPLIFY";

export type Interaction = {
  id: number;
  sessionId: number;
  interactionType: "RECALL" | "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "EXPLANATION";
  prompt: string;
  studentResponse: string;
  evaluation: Evaluation;
  isCorrect: boolean;
  attemptNumber: number;
  createdAt: string;
};

export type LearningSession = {
  id: number;
  topic: string;
  question: string;
  explanation: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  interactions: Interaction[];
  attemptCount: number;
};

export type InteractionResult = {
  evaluation: Evaluation;
  isCorrect: boolean;
  feedback: string;
  nextAction: NextAction;
  attemptNumber: number;
  interactionId: number;
  sessionId: number;
  sessionStatus: SessionStatus;
};