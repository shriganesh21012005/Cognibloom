import { LearningSessionStatus } from "@prisma/client";
import {
  createLearningSession,
  findLearningSessionById,
  updateLearningSessionStatus,
} from "../services/learningDatabase.js";
import { formatLearningSession } from "../services/sessionView.js";
import { requestBody, requiredString, routeId } from "../validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../errors.js";

export const createSession = asyncHandler(async (request, response) => {
  const body = requestBody(request.body);
  const topic = requiredString(body.topic, "topic");
  const question = requiredString(body.question, "question");

  const session = await createLearningSession({
    topic,
    question,
    explanation: "",
  });

  response.status(201).json({
    id: session.id,
    topic: session.topic,
    question: session.question,
    explanation: session.explanation,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    interactions: [],
    attemptCount: 0,
  });
});

export const getSession = asyncHandler(async (request, response) => {
  const id = routeId(request.params.id, "sessionId");
  const session = await findLearningSessionById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  response.json(formatLearningSession(session));
});

export const abandonSession = asyncHandler(async (request, response) => {
  const id = routeId(request.params.id, "sessionId");
  const session = await findLearningSessionById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.status === LearningSessionStatus.COMPLETED) {
    throw new ApiError(409, "Completed sessions cannot be abandoned");
  }

  const abandonedSession = await updateLearningSessionStatus(
    id,
    LearningSessionStatus.ABANDONED,
  );

  response.json(
    formatLearningSession({
      ...abandonedSession,
      interactions: session.interactions,
    }),
  );
});