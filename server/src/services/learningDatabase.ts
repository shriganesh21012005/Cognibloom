import {
  InteractionType,
  LearningSessionStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../db/prisma.js";

export type CreateLearningSessionInput = {
  topic: string;
  question: string;
  explanation: string;
  status?: LearningSessionStatus;
};

export type CreateInteractionInput = {
  sessionId: number;
  interactionType: InteractionType;
  prompt: string;
  studentResponse: string;
  evaluation: string;
  isCorrect: boolean;
  attemptNumber: number;
};

export type UpdateLearningSessionInput = {
  question?: string;
  explanation?: string;
  status?: LearningSessionStatus;
};

export function createLearningSession(input: CreateLearningSessionInput) {
  return prisma.learningSession.create({
    data: {
      topic: input.topic,
      question: input.question,
      explanation: input.explanation,
      status: input.status ?? LearningSessionStatus.IN_PROGRESS,
    },
  });
}

export function updateLearningSession(
  id: number,
  input: UpdateLearningSessionInput,
) {
  return prisma.learningSession.update({
    where: { id },
    data: input,
  });
}

export function findLearningSessionById(id: number) {
  return prisma.learningSession.findUnique({
    where: { id },
    include: {
      interactions: {
        orderBy: { attemptNumber: "asc" },
      },
    },
  });
}

export function updateLearningSessionStatus(
  id: number,
  status: LearningSessionStatus,
) {
  return prisma.learningSession.update({
    where: { id },
    data: { status },
  });
}

export function createInteraction(input: CreateInteractionInput) {
  const data: Prisma.InteractionUncheckedCreateInput = {
    sessionId: input.sessionId,
    interactionType: input.interactionType,
    prompt: input.prompt,
    studentResponse: input.studentResponse,
    evaluation: input.evaluation,
    isCorrect: input.isCorrect,
    attemptNumber: input.attemptNumber,
  };

  return prisma.interaction.create({ data });
}