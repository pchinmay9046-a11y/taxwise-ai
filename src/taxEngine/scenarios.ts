/**
 * TaxWise AI - Preloaded Realistic Business Scenarios
 * Includes the Phase 9 ₹1.2 Crore Demonstration Scenario and Entity Comparison Matrix
 */

import type { BusinessProfile } from './types.ts';
import { calculateBusinessTax } from './calculator.ts';

/**
 * ₹1.2 Crore Demonstration Business Scenario
 * Annual Gross Revenue: ₹1,20,00,000 (1.2 Crore)
 */
export const SCENARIO_1_2_CRORE: BusinessProfile = {
  id: 'scenario_1_2_cr',
  name: 'Acme Digital Solutions (₹1.2 Cr)',
  financialYear: 'FY 2025-26 (AY 2026-27)',
  entityType: 'proprietorship',
  taxRegime: 'new',
  revenueInputType: 'gross_revenue',
  
  grossRevenue: 12000000, // ₹1,20,00,000
  operatingExpenses: 2800000, // Rent, SaaS, servers, utilities, travel
  employeeCosts: 4200000,     // 6 employees
  rentAndUtilities: 720000,
  
  partnerRemunerationPaid: 0,
  interestOnCapitalPaid: 0,
  
  capitalExpenditureComputers: 450000,
  capitalExpenditureEquipment: 200000,
  capexTiming: 'before_oct_3',
  
  interestAndFinancing: 120000,
  otherIncome: 80000,
  existingDeductions80Cto80U: 150000,
  
  advanceTaxPaid: 450000,
  tdsPaid: 360000,
  tcsPaid: 0,
  
  employeeCount: 6,
  industry: 'IT Services & Software Consulting',
  businessAgeYears: 4,
  isDpiitRecognizedStartup: false,
  workingCapitalReserve: 1500000,
  state: 'Karnataka',
  digitalReceiptsPercentage: 98,
};

export const PRESET_SCENARIOS: { id: string; label: string; badge: string; profile: BusinessProfile }[] = [
  {
    id: 'demo_1_2_cr',
    label: '₹1.2 Crore Tech Firm (Official Demo)',
    badge: 'Phase 9 Demo',
    profile: SCENARIO_1_2_CRORE,
  },
  {
    id: 'freelancer_45_lakh',
    label: 'Tech Consultant & Professional (₹45 Lakh)',
    badge: 'Sec 44ADA Presumptive',
    profile: {
      id: 'scenario_freelance_45l',
      name: 'Vikas Tech Consulting (₹45 Lakhs)',
      financialYear: 'FY 2025-26 (AY 2026-27)',
      entityType: 'proprietorship',
      taxRegime: 'new',
      revenueInputType: 'gross_revenue',
      grossRevenue: 4500000,
      operatingExpenses: 650000,
      employeeCosts: 360000,
      rentAndUtilities: 180000,
      partnerRemunerationPaid: 0,
      interestOnCapitalPaid: 0,
      capitalExpenditureComputers: 220000,
      capitalExpenditureEquipment: 0,
      capexTiming: 'before_oct_3',
      interestAndFinancing: 0,
      otherIncome: 30000,
      existingDeductions80Cto80U: 150000,
      advanceTaxPaid: 150000,
      tdsPaid: 320000,
      tcsPaid: 0,
      employeeCount: 1,
      industry: 'Software Architecture & Design',
      businessAgeYears: 3,
      isDpiitRecognizedStartup: false,
      workingCapitalReserve: 500000,
      state: 'Maharashtra',
      digitalReceiptsPercentage: 100,
    },
  },
  {
    id: 'd2c_ecommerce_2_5_cr',
    label: 'D2C Consumer Brand (₹2.5 Crore)',
    badge: 'Pvt Ltd - 115BAA',
    profile: {
      id: 'scenario_d2c_2_5cr',
      name: 'Natura Essentials Pvt Ltd (₹2.5 Cr)',
      financialYear: 'FY 2025-26 (AY 2026-27)',
      entityType: 'pvt_ltd',
      taxRegime: '115BAA',
      revenueInputType: 'gross_revenue',
      grossRevenue: 25000000,
      operatingExpenses: 9500000, // inventory, logistics, ad spend
      employeeCosts: 6400000,
      rentAndUtilities: 1200000,
      partnerRemunerationPaid: 0,
      interestOnCapitalPaid: 0,
      capitalExpenditureComputers: 600000,
      capitalExpenditureEquipment: 800000,
      capexTiming: 'before_oct_3',
      interestAndFinancing: 450000,
      otherIncome: 120000,
      existingDeductions80Cto80U: 0,
      advanceTaxPaid: 1200000,
      tdsPaid: 450000,
      tcsPaid: 30000,
      employeeCount: 14,
      industry: 'E-commerce & Consumer Goods',
      businessAgeYears: 2,
      isDpiitRecognizedStartup: true,
      workingCapitalReserve: 3500000,
      state: 'Delhi NCR',
      digitalReceiptsPercentage: 96,
    },
  },
  {
    id: 'manufacturing_5_cr',
    label: 'Precision Engineering LLP (₹5.0 Crore)',
    badge: 'LLP - Sec 40(b)',
    profile: {
      id: 'scenario_manuf_5cr',
      name: 'Apex Precision Engineering LLP (₹5 Cr)',
      financialYear: 'FY 2025-26 (AY 2026-27)',
      entityType: 'llp',
      taxRegime: 'firm_standard',
      revenueInputType: 'gross_revenue',
      grossRevenue: 50000000,
      operatingExpenses: 22000000, // raw material, factory power, tooling
      employeeCosts: 14000000,
      rentAndUtilities: 2400000,
      partnerRemunerationPaid: 2400000,
      interestOnCapitalPaid: 600000,
      capitalExpenditureComputers: 400000,
      capitalExpenditureEquipment: 2500000,
      capexTiming: 'before_oct_3',
      interestAndFinancing: 1100000,
      otherIncome: 250000,
      existingDeductions80Cto80U: 0,
      advanceTaxPaid: 1800000,
      tdsPaid: 750000,
      tcsPaid: 50000,
      employeeCount: 32,
      industry: 'Precision Manufacturing & Auto Components',
      businessAgeYears: 7,
      isDpiitRecognizedStartup: false,
      workingCapitalReserve: 6000000,
      state: 'Tamil Nadu',
      digitalReceiptsPercentage: 92,
    },
  },
];

export interface EntityComparisonRow {
  entityLabel: string;
  entityType: string;
  regime: string;
  revenue: number;
  expenses: number;
  accountingProfit: number;
  taxableIncome: number;
  baselineTax: number;
  effectiveTaxRate: number;
  postTaxProfit: number;
  businessCashRemaining: number;
  personalTakeHome: number;
  statutoryAuditRequired: boolean;
  complianceOverhead: string;
  caveats: string;
}

/**
 * Computes comparative performance across all legal business structures
 * using identical underlying economic financials (Phase 9 requirement)
 */
export function generateEntityComparisonMatrix(baseProfile: BusinessProfile): EntityComparisonRow[] {
  const configs: {
    entityLabel: string;
    entityType: BusinessProfile['entityType'];
    taxRegime: BusinessProfile['taxRegime'];
    partnerRemuneration: number;
    complianceOverhead: string;
    caveats: string;
  }[] = [
    {
      entityLabel: 'Sole Proprietorship (New Regime Sec 115BAC)',
      entityType: 'proprietorship',
      taxRegime: 'new',
      partnerRemuneration: 0,
      complianceOverhead: 'Low (ITR-3/4, no MCA filing, audit only if turnover > ₹10 Cr)',
      caveats: 'Unlimited personal liability; cannot bring in equity partners.',
    },
    {
      entityLabel: 'Sole Proprietorship (Old Regime with Deductions)',
      entityType: 'proprietorship',
      taxRegime: 'old',
      partnerRemuneration: 0,
      complianceOverhead: 'Low (ITR-3, proofs required for 80C/80D claims)',
      caveats: 'Tax slab reaches 30% above ₹10L; higher surcharge if income > ₹50L.',
    },
    {
      entityLabel: 'Partnership Firm (Standard Section 40(b))',
      entityType: 'partnership',
      taxRegime: 'firm_standard',
      partnerRemuneration: Math.round(baseProfile.operatingExpenses * 0.25),
      complianceOverhead: 'Moderate (Partnership deed registration, Form 3CD audit if > threshold)',
      caveats: 'Unlimited liability for partners; flat 30% firm tax rate.',
    },
    {
      entityLabel: 'Limited Liability Partnership (LLP)',
      entityType: 'llp',
      taxRegime: 'firm_standard',
      partnerRemuneration: Math.round(baseProfile.operatingExpenses * 0.25),
      complianceOverhead: 'Moderate (Annual MCA Form 8 & 11, ITR-5, audit required if turnover > ₹40L or capital > ₹25L)',
      caveats: 'Flat 30% tax + 12% surcharge if > 1Cr. Limited liability shield for partners.',
    },
    {
      entityLabel: 'Private Limited Company (Section 115BAA)',
      entityType: 'pvt_ltd',
      taxRegime: '115BAA',
      partnerRemuneration: 0,
      complianceOverhead: 'High (Mandatory statutory CA audit, MCA ROC filings, Board meetings, Form 10-IC)',
      caveats: 'Flat 25.17% effective rate with zero MAT. Dividends taxed at shareholder slabs.',
    },
    {
      entityLabel: 'Private Limited Company (Normal Regime)',
      entityType: 'pvt_ltd',
      taxRegime: 'normal_company',
      partnerRemuneration: 0,
      complianceOverhead: 'High (Statutory audit, MAT computation u/s 115JB, ROC compliances)',
      caveats: '25% base tax; subject to 15% MAT on book profit if deductions claimed.',
    },
  ];

  return configs.map(cfg => {
    const simulatedProfile: BusinessProfile = {
      ...baseProfile,
      entityType: cfg.entityType,
      taxRegime: cfg.taxRegime,
      partnerRemunerationPaid: cfg.partnerRemuneration,
    };
    const res = calculateBusinessTax(simulatedProfile);

    return {
      entityLabel: cfg.entityLabel,
      entityType: cfg.entityType,
      regime: cfg.taxRegime,
      revenue: res.grossRevenue,
      expenses: res.allowableOperatingExpenses + res.depreciationClaimed,
      accountingProfit: res.preliminaryAccountingProfit,
      taxableIncome: res.taxableIncome,
      baselineTax: res.totalTaxLiability,
      effectiveTaxRate: res.effectiveTaxRate,
      postTaxProfit: res.postTaxAccountingProfit,
      businessCashRemaining: res.businessCashRemaining,
      personalTakeHome: res.estimatedPersonalTakeHome,
      statutoryAuditRequired: res.auditRequiredU44AB,
      complianceOverhead: cfg.complianceOverhead,
      caveats: cfg.caveats,
    };
  });
}
