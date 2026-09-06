import { InteractionType } from "@prisma/client";
import { ApiError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  createInteraction,
  findLearningSessionById,
  updateLearningSessionStatus,
} from "../services/learningDatabase.js";
import { evaluateMockResponse } from "../services/mockLearningService.js";
import {
  positiveInteger,
  requestBody,
  requiredString,
} from "../validation.js";

function parseInteractionType(value: unknown): InteractionType {
  if (
    typeof value !== "string" ||
    !Object.values(InteractionType).includes(value as InteractionType)
  ) {
    throw new ApiError(
      400,
      `interactionType must be one of: ${Object.values(InteractionType).join(", ")}`,
    );
  }

  return value as InteractionType;
}

export const createInteractionResult = asyncHandler(
  async (request, response) => {
    const body = requestBody(request.body);
    const sessionId = positiveInteger(body.sessionId, "sessionId");
    const interactionType = parseInteractionType(body.interactionType);
    const studentResponse = requiredString(
      body.studentResponse,
      "studentResponse",
    );
    const attemptNumber = positiveInteger(
      body.attemptNumber,
      "attemptNumber",
    );
    const session = await findLearningSessionById(sessionId);

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    const evaluation = evaluateMockResponse(
      session.question,
      studentResponse,
    );
    const interaction = await createInteraction({
      sessionId,
      interactionType,
      prompt: session.question,
      studentResponse,
      evaluation: evaluation.evaluation,
      isCorrect: evaluation.isCorrect,
      attemptNumber,
    });
    const status = evaluation.isCorrect ? "COMPLETED" : "IN_PROGRESS";
    await updateLearningSessionStatus(sessionId, status);

    response.status(201).json({
      evaluation: evaluation.evaluation,
      isCorrect: evaluation.isCorrect,
      feedback: evaluation.feedback,
      nextAction: evaluation.nextAction,
      attemptNumber,
      interactionId: interaction.id,
      sessionId,
      sessionStatus: status,
    });
  },
);