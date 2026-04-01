/**
 * Typed error thrown by sendRequest / sendRequestFile when the HTTP response is not ok.
 * Callers can catch this and inspect statusCode, message, or error for structured handling.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly error: string | string[];

  constructor(statusCode: number, message: string, error: string | string[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}
