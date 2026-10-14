import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";
import { retryApiQuery } from "./query-retry";

describe("retryApiQuery", () => {
  it("does not retry a non-retryable 4xx", () => {
    expect(retryApiQuery(0, new ApiError("Not found", 404))).toBe(false);
  });

  it("retries a 429 once", () => {
    expect(retryApiQuery(0, new ApiError("Rate limited", 429))).toBe(true);
    expect(retryApiQuery(1, new ApiError("Rate limited", 429))).toBe(false);
  });

  it("retries other errors up to twice", () => {
    expect(retryApiQuery(0, new ApiError("Server error", 500))).toBe(true);
    expect(retryApiQuery(1, new Error("boom"))).toBe(true);
    expect(retryApiQuery(2, new Error("boom"))).toBe(false);
  });
});
