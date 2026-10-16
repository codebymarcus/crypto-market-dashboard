import { describe, expect, it } from "vitest";
import { ApiError } from "./http/api-error";
import { retryApiQuery } from "./query-retry";

const httpError = (status: number) =>
  new ApiError("x", { kind: "http", source: "s", status });

describe("retryApiQuery", () => {
  it("does not retry a non-retryable 4xx", () => {
    expect(retryApiQuery(0, httpError(404))).toBe(false);
  });

  it("retries a 429 once", () => {
    expect(retryApiQuery(0, httpError(429))).toBe(true);
    expect(retryApiQuery(1, httpError(429))).toBe(false);
  });

  it("retries a 408 once", () => {
    expect(retryApiQuery(0, httpError(408))).toBe(true);
    expect(retryApiQuery(1, httpError(408))).toBe(false);
  });

  it("retries a 5xx up to twice", () => {
    expect(retryApiQuery(0, httpError(500))).toBe(true);
    expect(retryApiQuery(2, httpError(500))).toBe(false);
  });

  it("does not retry network, timeout, parse, or shape errors", () => {
    for (const kind of ["network", "timeout", "parse", "shape"] as const) {
      expect(retryApiQuery(0, new ApiError("x", { kind, source: "s" }))).toBe(
        false,
      );
    }
  });

  it("retries an unexpected non-ApiError up to twice", () => {
    expect(retryApiQuery(1, new Error("boom"))).toBe(true);
    expect(retryApiQuery(2, new Error("boom"))).toBe(false);
  });
});
