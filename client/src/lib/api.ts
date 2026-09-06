import type {
  InteractionResult,
  LearningSession,
} from "../types";

type ApiErrorPayload = {
  error?: string;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      "We can't reach CogniBloom right now. Check that the backend is running and try again.",
    );
  }

  let payload: T | ApiErrorPayload;
  try {
    payload = (await response.json()) as T | ApiErrorPayload;
  } catch {
    throw new ApiClientError(
      "The server returned an unexpected response. Please try again.",
      response.status,
    );
  }

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Something went wrong. Please try again.";
    throw new ApiClientError(errorMessage, response.status);
  }

  return payload as T;
}

export function getHealth() {
  return request<{ status: string }>("/api/health");
}

export function createSession(topic: string, question: string) {
  return request<LearningSession>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ topic, question }),
  });
}

export function createQuestion(sessionId: number, question: string) {
  return request<LearningSession>("/api/questions", {
    method: "POST",
    body: JSON.stringify({ sessionId, question }),
  });
}

export function getSession(sessionId: number) {
  return request<LearningSession>(`/api/sessions/${sessionId}`);
}

export function abandonSession(sessionId: number) {
  return request<LearningSession>(`/api/sessions/${sessionId}/abandon`, {
    method: "POST",
  });
}

export function submitInteraction(
  sessionId: number,
  studentResponse: string,
  attemptNumber: number,
) {
  return request<InteractionResult>("/api/interactions", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      interactionType: "SHORT_ANSWER",
      studentResponse,
      attemptNumber,
    }),
  });
}