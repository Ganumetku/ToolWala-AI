// ToolWala AI - Official Indian Income Tax Slab Constants
// Verified for FY 2026-27 (AY 2027-28), FY 2025-26 & FY 2024-25

export type AgeCategory = 'below60' | 'senior' | 'superSenior';
export type FinancialYear = '2026-2027' | '2025-2026' | '2024-2025';
export type IncomeType = 'salaried' | 'business';

export interface TaxSlab {
  min: number;
  max: number | null; // null means Infinity / Above
  rate: number; // percentage e.g. 5 for 5%
  label: string;
}

export interface RegimeConfig {
  standardDeduction: number; // Standard deduction (salaried/pensioners)
  rebate87ALimit: number;   // Max taxable income threshold for 87A rebate
  rebate87AMaxAmount: number; // Max rebate amount
  hasMarginalRelief87A: boolean; // True for New Regime FY 2026-27 (up to ₹12L)
  slabs: Record<AgeCategory, TaxSlab[]>;
}

export interface FYTaxConfig {
  year: FinancialYear;
  label: string;
  ayLabel: string;
  newRegime: RegimeConfig;
  oldRegime: RegimeConfig;
}

export const DEDUCTION_LIMITS = {
  sec80C: 150000,
  sec80DGeneral: 25000,
  sec80DSenior: 50000,
  sec80CCD1B: 50000,
  sec24b: 200000,
};

// Official Tax Slabs Data Matrix
export const TAX_CONFIG: Record<FinancialYear, FYTaxConfig> = {
  '2026-2027': {
    year: '2026-2027',
    label: 'FY 2026-27 (Budget 2025/2026)',
    ayLabel: 'AY 2027-28',
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 1200000,
      rebate87AMaxAmount: 60000,
      hasMarginalRelief87A: true,
      slabs: {
        below60: [
          { min: 0, max: 400000, rate: 0, label: "Up to ₹4,00,000" },
          { min: 400000, max: 800000, rate: 5, label: "₹4,00,001 to ₹8,00,000" },
          { min: 800000, max: 1200000, rate: 10, label: "₹8,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1600000, rate: 15, label: "₹12,00,001 to ₹16,00,000" },
          { min: 1600000, max: 2000000, rate: 20, label: "₹16,00,001 to ₹20,00,000" },
          { min: 2000000, max: 2400000, rate: 25, label: "₹20,00,001 to ₹24,00,000" },
          { min: 2400000, max: null, rate: 30, label: "Above ₹24,00,000" }
        ],
        senior: [
          { min: 0, max: 400000, rate: 0, label: "Up to ₹4,00,000" },
          { min: 400000, max: 800000, rate: 5, label: "₹4,00,001 to ₹8,00,000" },
          { min: 800000, max: 1200000, rate: 10, label: "₹8,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1600000, rate: 15, label: "₹12,00,001 to ₹16,00,000" },
          { min: 1600000, max: 2000000, rate: 20, label: "₹16,00,001 to ₹20,00,000" },
          { min: 2000000, max: 2400000, rate: 25, label: "₹20,00,001 to ₹24,00,000" },
          { min: 2400000, max: null, rate: 30, label: "Above ₹24,00,000" }
        ],
        superSenior: [
          { min: 0, max: 400000, rate: 0, label: "Up to ₹4,00,000" },
          { min: 400000, max: 800000, rate: 5, label: "₹4,00,001 to ₹8,00,000" },
          { min: 800000, max: 1200000, rate: 10, label: "₹8,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1600000, rate: 15, label: "₹12,00,001 to ₹16,00,000" },
          { min: 1600000, max: 2000000, rate: 20, label: "₹16,00,001 to ₹20,00,000" },
          { min: 2000000, max: 2400000, rate: 25, label: "₹20,00,001 to ₹24,00,000" },
          { min: 2400000, max: null, rate: 30, label: "Above ₹24,00,000" }
        ]
      }
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMaxAmount: 12500,
      hasMarginalRelief87A: false,
      slabs: {
        below60: [
          { min: 0, max: 250000, rate: 0, label: "Up to ₹2,50,000" },
          { min: 250000, max: 500000, rate: 5, label: "₹2,50,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        senior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 500000, rate: 5, label: "₹3,00,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        superSenior: [
          { min: 0, max: 500000, rate: 0, label: "Up to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ]
      }
    }
  },
  '2025-2026': {
    year: '2025-2026',
    label: 'FY 2025-26',
    ayLabel: 'AY 2026-27',
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000,
      rebate87AMaxAmount: 25000,
      hasMarginalRelief87A: true,
      slabs: {
        below60: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ],
        senior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ],
        superSenior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ]
      }
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMaxAmount: 12500,
      hasMarginalRelief87A: false,
      slabs: {
        below60: [
          { min: 0, max: 250000, rate: 0, label: "Up to ₹2,50,000" },
          { min: 250000, max: 500000, rate: 5, label: "₹2,50,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        senior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 500000, rate: 5, label: "₹3,00,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        superSenior: [
          { min: 0, max: 500000, rate: 0, label: "Up to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ]
      }
    }
  },
  '2024-2025': {
    year: '2024-2025',
    label: 'FY 2024-25',
    ayLabel: 'AY 2025-26',
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000,
      rebate87AMaxAmount: 25000,
      hasMarginalRelief87A: true,
      slabs: {
        below60: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ],
        senior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ],
        superSenior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 700000, rate: 5, label: "₹3,00,001 to ₹7,00,000" },
          { min: 700000, max: 1000000, rate: 10, label: "₹7,00,001 to ₹10,00,000" },
          { min: 1000000, max: 1200000, rate: 15, label: "₹10,00,001 to ₹12,00,000" },
          { min: 1200000, max: 1500000, rate: 20, label: "₹12,00,001 to ₹15,00,000" },
          { min: 1500000, max: null, rate: 30, label: "Above ₹15,00,000" }
        ]
      }
    },
    oldRegime: {
      standardDeduction: 50000,
      rebate87ALimit: 500000,
      rebate87AMaxAmount: 12500,
      hasMarginalRelief87A: false,
      slabs: {
        below60: [
          { min: 0, max: 250000, rate: 0, label: "Up to ₹2,50,000" },
          { min: 250000, max: 500000, rate: 5, label: "₹2,50,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        senior: [
          { min: 0, max: 300000, rate: 0, label: "Up to ₹3,00,000" },
          { min: 300000, max: 500000, rate: 5, label: "₹3,00,001 to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ],
        superSenior: [
          { min: 0, max: 500000, rate: 0, label: "Up to ₹5,00,000" },
          { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 to ₹10,00,000" },
          { min: 1000000, max: null, rate: 30, label: "Above ₹10,00,000" }
        ]
      }
    }
  }
};

// Calculate Base Surcharge Rate without Marginal Relief
export function getSurchargeRate(taxableIncome: number, isNewRegime: boolean): number {
  if (taxableIncome > 50000000) return isNewRegime ? 25 : 37; // > ₹5 Crore
  if (taxableIncome > 20000000) return 25; // > ₹2 Crore
  if (taxableIncome > 10000000) return 15; // > ₹1 Crore
  if (taxableIncome > 5000000) return 10;  // > ₹50 Lakhs
  return 0;
}

// Calculate Surcharge with Marginal Relief for threshold crossings (> 50L, > 1Cr, > 2Cr, > 5Cr)
export function calculateSurchargeWithMarginalRelief(
  taxableIncome: number,
  basicTaxAfterRebate: number,
  isNewRegime: boolean,
  calculateBasicTaxFn: (income: number) => number
): { rate: number; surchargeAmount: number; marginalRelief: number } {
  let rate = 0;
  let threshold = 0;
  let lowerRate = 0;

  if (taxableIncome > 50000000) {
    rate = isNewRegime ? 25 : 37;
    threshold = 50000000;
    lowerRate = 25;
  } else if (taxableIncome > 20000000) {
    rate = 25;
    threshold = 20000000;
    lowerRate = 15;
  } else if (taxableIncome > 10000000) {
    rate = 15;
    threshold = 10000000;
    lowerRate = 10;
  } else if (taxableIncome > 5000000) {
    rate = 10;
    threshold = 5000000;
    lowerRate = 0;
  } else {
    return { rate: 0, surchargeAmount: 0, marginalRelief: 0 };
  }

  const rawSurcharge = (basicTaxAfterRebate * rate) / 100;
  const taxPlusRawSurcharge = basicTaxAfterRebate + rawSurcharge;

  // Threshold tax calculation
  const basicTaxAtThreshold = calculateBasicTaxFn(threshold);
  const surchargeAtThreshold = (basicTaxAtThreshold * lowerRate) / 100;
  const maxAllowedTaxPlusSurcharge = (basicTaxAtThreshold + surchargeAtThreshold) + (taxableIncome - threshold);

  if (taxPlusRawSurcharge > maxAllowedTaxPlusSurcharge) {
    const marginalRelief = taxPlusRawSurcharge - maxAllowedTaxPlusSurcharge;
    const finalSurcharge = Math.max(0, rawSurcharge - marginalRelief);
    return { rate, surchargeAmount: finalSurcharge, marginalRelief };
  }

  return { rate, surchargeAmount: rawSurcharge, marginalRelief: 0 };
}
