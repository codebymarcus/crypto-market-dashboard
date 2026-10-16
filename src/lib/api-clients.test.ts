import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { coinGeckoClient } from "./api-clients";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("coinGeckoClient", () => {
  it("targets the CoinGecko base URL and sends no API-key header by default", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await coinGeckoClient.get("/ping", { schema: z.object({}) });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.coingecko.com/api/v3/ping");
    expect((init as RequestInit).headers).toBeUndefined();
  });
});
