export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function getErrorStatusCode(error: unknown, fallback = 500) {
  return error instanceof HttpError ? error.statusCode : fallback;
}
