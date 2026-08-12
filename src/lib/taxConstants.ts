// ToolWala AI - Official Indian Income Tax Slab Constants (FY 2024-25 / FY 2025-26)

export type AgeCategory = 'below60' | 'senior' | 'superSenior';
export type FinancialYear = '2024-2025' | '2025-2026';

export interface TaxSlab {
  min: number;
  max: number | null; // null means Infinity
  rate: number; // percentage e.g. 5 for 5%
  label: string;
}

export interface RegimeConfig {
  standardDeduction: number;
  rebate87ALimit: number;
  rebate87AMaxAmount: number;
  slabs: Record<AgeCategory, TaxSlab[]>;
}

// Official Tax Slabs Config
export const TAX_CONFIG: Record<FinancialYear, { newRegime: RegimeConfig; oldRegime: RegimeConfig }> = {
  '2024-2025': {
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000,
      rebate87AMaxAmount: 25000,
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
    newRegime: {
      standardDeduction: 75000,
      rebate87ALimit: 700000,
      rebate87AMaxAmount: 25000,
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

// Calculate Surcharge Percentage
export function getSurchargeRate(taxableIncome: number, isNewRegime: boolean): number {
  if (taxableIncome > 50000000) return isNewRegime ? 25 : 37; // > 5 Crore
  if (taxableIncome > 20000000) return 25; // > 2 Crore
  if (taxableIncome > 10000000) return 15; // > 1 Crore
  if (taxableIncome > 5000000) return 10;  // > 50 Lakhs
  return 0;
}
