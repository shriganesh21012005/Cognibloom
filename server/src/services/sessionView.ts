import { Prisma } from "@prisma/client";

export type LearningSessionWithInteractions =
  Prisma.LearningSessionGetPayload<{
    include: { interactions: true };
  }>;

export function formatLearningSession(
  session: LearningSessionWithInteractions,
) {
  return {
    id: session.id,
    topic: session.topic,
    question: session.question,
    explanation: session.explanation,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    interactions: session.interactions,
    attemptCount: session.interactions.length,
  };
}