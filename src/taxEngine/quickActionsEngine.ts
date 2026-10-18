/**
 * TaxWise AI - Quick Actions Engine
 * Decoupled logic for Quick Expense logging and Quick Scenario simulations
 */

import type { BusinessProfile, TaxCalculationResult } from './types.ts';
import { calculateBusinessTax, calculateSection40bPartnerRemunerationLimit } from './calculator.ts';

export type QuickExpenseCategory =
  | 'operating_expense'
  | 'computers_capex'
  | 'equipment_capex'
  | 'employee_cost'
  | 'rent_utilities'
  | 'corporate_nps';

export interface QuickExpenseInput {
  category: QuickExpenseCategory;
  amount: number;
  description: string;
  vendorName?: string;
  date?: string;
  capexTiming?: 'before_oct_3' | 'after_oct_3';
  isWhollyBusinessPurpose?: boolean;
  hasValidGstInvoice?: boolean;
}

export interface LoggedExpense extends QuickExpenseInput {
  id: string;
  timestamp: number;
  immediateDeduction: number;
  taxSaved: number;
  netCashCost: number;
}

export interface ExpenseTaxImpact {
  immediateDeduction: number;
  taxSaved: number;
  netCashCost: number;
  baselineTax: number;
  newTax: number;
  taxSavingsPct: number;
  statutorySection: string;
  explanation: string;
}

/**
 * Calculates the exact tax deduction and tax saved for a given expense under the profile's tax regime
 */
export function calculateExpenseTaxImpact(
  profile: BusinessProfile,
  expense: QuickExpenseInput
): ExpenseTaxImpact {
  const amount = Math.max(0, expense.amount || 0);
  const capexTiming = expense.capexTiming || profile.capexTiming || 'before_oct_3';

  // Determine immediate allowable tax deduction
  let immediateDeduction = 0;
  let statutorySection = 'Section 37(1)';
  let explanation = '';

  switch (expense.category) {
    case 'operating_expense':
      immediateDeduction = amount;
      statutorySection = 'Section 37(1)';
      explanation = '100% allowable as regular revenue operating expenditure wholly for business.';
      break;

    case 'computers_capex': {
      const rate = capexTiming === 'before_oct_3' ? 0.40 : 0.20;
      immediateDeduction = Math.round(amount * rate);
      statutorySection = 'Section 32 (Computers & Tech)';
      explanation = capexTiming === 'before_oct_3'
        ? '40% depreciation in Year 1 (put to use >= 180 days). Balance ₹' + (amount - immediateDeduction).toLocaleString('en-IN') + ' depreciated in subsequent years.'
        : '20% depreciation in Year 1 (put to use < 180 days u/s 32 second proviso). Balance depreciated in subsequent years.';
      break;
    }

    case 'equipment_capex': {
      const rate = capexTiming === 'before_oct_3' ? 0.15 : 0.075;
      immediateDeduction = Math.round(amount * rate);
      statutorySection = 'Section 32 (Plant & Machinery)';
      explanation = capexTiming === 'before_oct_3'
        ? '15% depreciation in Year 1. Balance written down in subsequent years.'
        : '7.5% depreciation in Year 1 (put to use < 180 days). Balance written down in subsequent years.';
      break;
    }

    case 'employee_cost':
      immediateDeduction = amount;
      statutorySection = 'Section 37(1) (Salaries & Wages)';
      explanation = '100% deductible business expense against gross business revenue.';
      break;

    case 'rent_utilities':
      immediateDeduction = amount;
      statutorySection = 'Section 30 & 31 (Rent, Rates & Taxes)';
      explanation = '100% deductible revenue expenditure for business premises.';
      break;

    case 'corporate_nps':
      immediateDeduction = amount;
      statutorySection = 'Section 36(1)(iv) & 80CCD(2)';
      explanation = '100% deductible employer contribution up to 10% (14% for Central/State Govt) of basic salary.';
      break;

    default:
      immediateDeduction = amount;
      statutorySection = 'Section 37(1)';
      explanation = '100% allowable business deduction.';
  }

  // Calculate baseline tax
  const baselineCalc = calculateBusinessTax(profile);

  // Create simulated profile with this immediate tax deduction applied
  const simProfile: BusinessProfile = {
    ...profile,
    operatingExpenses: profile.operatingExpenses + immediateDeduction,
  };

  const simCalc = calculateBusinessTax(simProfile);

  const taxSaved = Math.max(0, baselineCalc.totalTaxLiability - simCalc.totalTaxLiability);
  const netCashCost = Math.max(0, amount - taxSaved);
  const taxSavingsPct = baselineCalc.totalTaxLiability > 0
    ? (taxSaved / baselineCalc.totalTaxLiability) * 100
    : 0;

  return {
    immediateDeduction,
    taxSaved,
    netCashCost,
    baselineTax: baselineCalc.totalTaxLiability,
    newTax: simCalc.totalTaxLiability,
    taxSavingsPct,
    statutorySection,
    explanation,
  };
}

/**
 * Applies a logged expense into a clone of the business profile
 */
export function applyExpenseToProfile(
  profile: BusinessProfile,
  expense: QuickExpenseInput
): BusinessProfile {
  const updated: BusinessProfile = { ...profile };
  const amount = Math.max(0, expense.amount || 0);

  switch (expense.category) {
    case 'operating_expense':
      updated.operatingExpenses = (updated.operatingExpenses || 0) + amount;
      break;

    case 'computers_capex':
      updated.capitalExpenditureComputers = (updated.capitalExpenditureComputers || 0) + amount;
      if (expense.capexTiming) {
        updated.capexTiming = expense.capexTiming;
      }
      break;

    case 'equipment_capex':
      updated.capitalExpenditureEquipment = (updated.capitalExpenditureEquipment || 0) + amount;
      if (expense.capexTiming) {
        updated.capexTiming = expense.capexTiming;
      }
      break;

    case 'employee_cost':
      updated.employeeCosts = (updated.employeeCosts || 0) + amount;
      break;

    case 'rent_utilities':
      updated.rentAndUtilities = (updated.rentAndUtilities || 0) + amount;
      break;

    case 'corporate_nps':
      // Under Indian tax, employer NPS contribution is part of allowable business employee benefits
      updated.employeeCosts = (updated.employeeCosts || 0) + amount;
      break;

    default:
      updated.operatingExpenses = (updated.operatingExpenses || 0) + amount;
  }

  return updated;
}

export type QuickScenarioPreset =
  | 'revenue_surge_25'
  | 'capex_blitz_5l'
  | 'corporate_nps_shift'
  | 'regime_switch'
  | 'max_partner_remuneration';

export interface QuickScenarioResult {
  preset: QuickScenarioPreset;
  title: string;
  badge: string;
  description: string;
  simulatedProfile: BusinessProfile;
  baselineCalculation: TaxCalculationResult;
  simulatedCalculation: TaxCalculationResult;
  taxDiff: number; // positive = increased tax, negative = reduced tax
  profitDiff: number;
  cashDiff: number;
  keyInsights: string[];
}

/**
 * Generates an instant what-if scenario preview based on pre-defined business presets
 */
export function generateQuickScenario(
  profile: BusinessProfile,
  preset: QuickScenarioPreset
): QuickScenarioResult {
  const baseCalc = calculateBusinessTax(profile);
  const sim = { ...profile };
  let title = '';
  let badge = '';
  let description = '';
  const keyInsights: string[] = [];

  switch (preset) {
    case 'revenue_surge_25': {
      title = 'Revenue Surge (+25% Turnover)';
      badge = 'Growth Simulation';
      description = 'Simulate 25% rapid top-line growth with proportionate operating scale.';
      const addedRevenue = Math.round(profile.grossRevenue * 0.25);
      const addedExpenses = Math.round(profile.operatingExpenses * 0.15); // operating leverage
      sim.grossRevenue += addedRevenue;
      sim.operatingExpenses += addedExpenses;

      keyInsights.push(`Gross Revenue expands by ₹${addedRevenue.toLocaleString('en-IN')}`);
      keyInsights.push('Assumes operating leverage: expenses only expand by 15%');
      if (sim.grossRevenue > 10000000 && profile.grossRevenue <= 10000000) {
        keyInsights.push('Caution: Crosses ₹10 Crore threshold for Section 44AB tax audit!');
      }
      break;
    }

    case 'capex_blitz_5l': {
      title = 'Tech Capex Blitz (+₹5 Lakhs)';
      badge = 'Section 32 Write-Off';
      description = 'Purchase ₹5,00,000 in IT computers, laptops & servers before October 3.';
      sim.capitalExpenditureComputers = (sim.capitalExpenditureComputers || 0) + 500000;
      sim.capexTiming = 'before_oct_3';

      keyInsights.push('Immediate 40% depreciation deduction: ₹2,00,000 write-off');
      keyInsights.push('Hardware assets remain 100% on company balance sheet');
      keyInsights.push('Put to use before October 3 secures full-year depreciation rate');
      break;
    }

    case 'corporate_nps_shift': {
      title = 'Section 80CCD(2) Corporate NPS Allocation';
      badge = 'Zero-Tax Employee Benefit';
      description = 'Restructure 10% of payroll into employer National Pension Scheme contribution.';
      // Add existing deductions or shift salary: in company/firm it is fully deductible under Sec 36(1)(iv)
      const npsAmount = Math.round(Math.min(500000, profile.employeeCosts * 0.10));
      sim.existingDeductions80Cto80U = (sim.existingDeductions80Cto80U || 0) + npsAmount;
      sim.operatingExpenses = (sim.operatingExpenses || 0) + Math.round(npsAmount * 0.2); // incidental setup

      keyInsights.push(`Diverts ₹${npsAmount.toLocaleString('en-IN')} into regulated Tier-I pension`);
      keyInsights.push('100% deductible for employer with zero perquisite tax on employee');
      keyInsights.push('Exempt from standard ₹1.5 Lakh Section 80C cap');
      break;
    }

    case 'regime_switch': {
      title = profile.taxRegime === 'new'
        ? 'Switch to Concessional 115BAA / Old'
        : 'Switch to Section 115BAC (New Regime)';
      badge = 'Regime Arbitrage';
      description = 'Instantly compare tax liability under the alternative statutory tax regime.';

      if (profile.entityType === 'pvt_ltd' || profile.entityType === 'public_ltd') {
        sim.taxRegime = profile.taxRegime === '115BAA' ? 'normal_company' : '115BAA';
      } else {
        sim.taxRegime = profile.taxRegime === 'new' ? 'old' : 'new';
      }

      keyInsights.push(`Evaluates liability under ${sim.taxRegime.toUpperCase()} regime`);
      keyInsights.push('Compares basic tax slab progression vs surcharge and cess');
      keyInsights.push('Assess whether foregone exemptions outweigh flat lower rates');
      break;
    }

    case 'max_partner_remuneration': {
      title = 'Maximize Section 40(b) Partner Remuneration';
      badge = 'Firm / LLP Optimization';
      description = 'Max out allowable partner salary based on statutory book profit limits.';

      // Calculate allowable limit
      const preliminaryProfit = Math.max(0, profile.grossRevenue - profile.operatingExpenses - profile.employeeCosts - profile.rentAndUtilities);
      const allowableLimit = calculateSection40bPartnerRemunerationLimit(preliminaryProfit);

      sim.partnerRemunerationPaid = allowableLimit;

      keyInsights.push(`Statutory 40(b) ceiling calculated at ₹${allowableLimit.toLocaleString('en-IN')}`);
      keyInsights.push('Deducted 100% from firm taxable profit at flat 30% saving');
      keyInsights.push('Taxed in partner hands according to individual slab rates');
      break;
    }
  }

  const simCalc = calculateBusinessTax(sim);
  const taxDiff = simCalc.totalTaxLiability - baseCalc.totalTaxLiability;
  const profitDiff = simCalc.postTaxAccountingProfit - baseCalc.postTaxAccountingProfit;
  const cashDiff = simCalc.businessCashRemaining - baseCalc.businessCashRemaining;

  return {
    preset,
    title,
    badge,
    description,
    simulatedProfile: sim,
    baselineCalculation: baseCalc,
    simulatedCalculation: simCalc,
    taxDiff,
    profitDiff,
    cashDiff,
    keyInsights,
  };
}
