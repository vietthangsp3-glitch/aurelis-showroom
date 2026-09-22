export interface FinanceInput {
  vehiclePrice: number;
  downPaymentPercent: number;
  termMonths: number;
  annualInterestRate: number;
  initialCosts: number;
}

export interface FinanceResult {
  downPayment: number;
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

export function calculateFinance(input: FinanceInput): FinanceResult {
  const { vehiclePrice, downPaymentPercent, termMonths, annualInterestRate, initialCosts } = input;
  if (vehiclePrice <= 0 || termMonths <= 0) throw new Error("Giá xe và thời hạn vay phải lớn hơn 0.");
  if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    throw new Error("Tỷ lệ trả trước không hợp lệ.");
  }

  const downPayment = vehiclePrice * (downPaymentPercent / 100);
  const principal = vehiclePrice - downPayment;
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalInterest = monthlyPayment * termMonths - principal;

  return {
    downPayment,
    principal,
    monthlyPayment,
    totalInterest,
    totalCost: downPayment + monthlyPayment * termMonths + initialCosts,
  };
}
