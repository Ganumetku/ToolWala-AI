// ToolWala AI - Tax Slabs Data Structure (FY 2026-27 & Historical Years)
import { TAX_CONFIG, getSurchargeRate, calculateSurchargeWithMarginalRelief, DEDUCTION_LIMITS } from '@/lib/taxConstants';

export const TAX_SLABS = {
  "2026-27": TAX_CONFIG['2026-2027'],
  "2025-26": TAX_CONFIG['2025-2026'],
  "2024-25": TAX_CONFIG['2024-2025']
};

export { getSurchargeRate, calculateSurchargeWithMarginalRelief, DEDUCTION_LIMITS };
