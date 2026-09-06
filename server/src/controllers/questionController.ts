import { ApiError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  findLearningSessionById,
  updateLearningSession,
} from "../services/learningDatabase.js";
import { generateMockExplanation } from "../services/mockLearningService.js";
import { formatLearningSession } from "../services/sessionView.js";
import { positiveInteger, requestBody, requiredString } from "../validation.js";

export const createQuestion = asyncHandler(async (request, response) => {
  const body = requestBody(request.body);
  const sessionId = positiveInteger(body.sessionId, "sessionId");
  const question = requiredString(body.question, "question");
  const existingSession = await findLearningSessionById(sessionId);

  if (!existingSession) {
    throw new ApiError(404, "Session not found");
  }

  const explanation = generateMockExplanation(question);
  const session = await updateLearningSession(sessionId, {
    question,
    explanation,
  });

  response.json(
    formatLearningSession({
      ...session,
      interactions: existingSession.interactions,
    }),
  );
});