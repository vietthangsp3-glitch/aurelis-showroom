import { describe, expect, it } from "vitest";
import { calculateFinance } from "./calculate-finance";

describe("calculateFinance", () => {
  it("calculates amortized monthly payments", () => {
    const result = calculateFinance({
      vehiclePrice: 1_000_000_000,
      downPaymentPercent: 30,
      termMonths: 60,
      annualInterestRate: 8,
      initialCosts: 100_000_000,
    });
    expect(result.principal).toBe(700_000_000);
    expect(result.monthlyPayment).toBeGreaterThan(14_000_000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("rejects invalid percentages", () => {
    expect(() =>
      calculateFinance({
        vehiclePrice: 1,
        downPaymentPercent: 110,
        termMonths: 12,
        annualInterestRate: 8,
        initialCosts: 0,
      }),
    ).toThrow();
  });
});
