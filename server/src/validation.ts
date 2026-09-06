import { ApiError } from "./errors.js";

export function requestBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Request body must be a JSON object");
  }

  return body as Record<string, unknown>;
}

export function requiredString(
  value: unknown,
  fieldName: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${fieldName} must not be empty`);
  }

  return value.trim();
}

export function positiveInteger(
  value: unknown,
  fieldName: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }

  return value;
}

export function routeId(value: unknown, fieldName = "id"): number {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }

  return Number(value);
}

export function optionalRating(value: unknown): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 5
  ) {
    throw new ApiError(400, "rating must be an integer between 1 and 5");
  }

  return value;
}

export function optionalString(
  value: unknown,
  fieldName: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${fieldName} must be a string`);
  }

  return value.trim();
}