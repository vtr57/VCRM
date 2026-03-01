import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCurrentMonthPeriod, getPeriodFromSearchParams, getRollingPeriod } from "@/lib/period";

describe("period helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the current month period", () => {
    expect(getCurrentMonthPeriod()).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("returns a rolling period", () => {
    expect(getRollingPeriod(7)).toEqual({
      from: "2026-02-22",
      to: "2026-02-28",
    });
  });

  it("reads the period from search params", () => {
    expect(
      getPeriodFromSearchParams(new URLSearchParams("from=2026-01-01&to=2026-01-31")),
    ).toEqual({
      from: "2026-01-01",
      to: "2026-01-31",
    });
  });
});
