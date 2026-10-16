import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";

describe("ApiError", () => {
  it("carries kind, source, status, and message", () => {
    const error = new ApiError("Nope", {
      kind: "http",
      source: "coingecko",
      status: 404,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("Nope");
    expect(error.kind).toBe("http");
    expect(error.source).toBe("coingecko");
    expect(error.status).toBe(404);
  });

  it("preserves the original cause", () => {
    const cause = new Error("root");
    const error = new ApiError("x", { kind: "network", source: "s", cause });

    expect(error.cause).toBe(cause);
  });
});
