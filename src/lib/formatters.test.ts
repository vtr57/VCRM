import { describe, expect, it } from "vitest";

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/formatters";

describe("formatters", () => {
  it("formats currency in pt-BR", () => {
    expect(formatCurrency("1250")).toContain("1.250");
  });

  it("formats percent values", () => {
    expect(formatPercent(42.5)).toBe("42,5%");
  });

  it("formats compact numbers", () => {
    expect(formatCompactNumber(1200).toLowerCase()).toContain("mil");
  });

  it("formats dates and datetimes with fallbacks", () => {
    expect(formatDate(null)).toBe("Sem data");
    expect(formatDateTime(null)).toBe("Sem registro");
    expect(formatDate("2026-02-28")).not.toBe("Sem data");
  });
});
