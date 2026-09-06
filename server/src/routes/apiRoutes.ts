import { Router } from "express";
import { submitFeedback } from "../controllers/feedbackController.js";
import { createInteractionResult } from "../controllers/interactionController.js";
import { createQuestion } from "../controllers/questionController.js";
import {
  abandonSession,
  createSession,
  getSession,
} from "../controllers/sessionController.js";

const apiRouter = Router();

apiRouter.post("/sessions", createSession);
apiRouter.get("/sessions/:id", getSession);
apiRouter.post("/sessions/:id/abandon", abandonSession);
apiRouter.post("/questions", createQuestion);
apiRouter.post("/interactions", createInteractionResult);
apiRouter.post("/feedback", submitFeedback);

export default apiRouter;