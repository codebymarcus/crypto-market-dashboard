import { describe, expect, it } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("returns N/A for null", () => {
    expect(formatPrice(null)).toBe("N/A");
  });

  it("returns N/A for non-finite numbers", () => {
    expect(formatPrice(NaN)).toBe("N/A");
    expect(formatPrice(Infinity)).toBe("N/A");
    expect(formatPrice(-Infinity)).toBe("N/A");
  });

  it("formats a whole-dollar price as USD currency", () => {
    // maximumSignificantDigits drops trailing cents for whole-dollar amounts.
    expect(formatPrice(60000)).toBe("$60,000");
  });

  it("formats zero as USD currency", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("preserves precision for sub-cent prices via significant digits", () => {
    expect(formatPrice(0.00001234)).toBe("$0.00001234");
  });
});
