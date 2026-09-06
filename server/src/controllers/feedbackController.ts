import { ApiError } from "../errors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { findLearningSessionById } from "../services/learningDatabase.js";
import {
  optionalRating,
  optionalString,
  positiveInteger,
  requestBody,
} from "../validation.js";

export const submitFeedback = asyncHandler(async (request, response) => {
  const body = requestBody(request.body);
  const sessionId = positiveInteger(body.sessionId, "sessionId");
  const rating = optionalRating(body.rating);
  const comment = optionalString(body.comment, "comment");
  const session = await findLearningSessionById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  response.json({
    sessionId,
    accepted: false,
    persisted: false,
    rating: rating ?? null,
    comment: comment ?? null,
    message:
      "Feedback was received but is not persisted because the current schema has no feedback structure.",
  });
});