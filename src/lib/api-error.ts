/**
 * Base class for API errors across feature slices.
 *
 * Each API module declares its own subclass (so callers can discriminate
 * with `instanceof`), overriding only `name`. The shared `status` field and
 * constructor live here. User-facing messages stay plain English.
 */
export class ApiError extends Error {
  public readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
