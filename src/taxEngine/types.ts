/**
 * TaxWise AI - Core Data Types & Constants
 * Indian Business Tax Planning & Optimization Engine
 */

export type EntityType = 
  | 'proprietorship'
  | 'partnership'
  | 'llp'
  | 'pvt_ltd'
  | 'public_ltd';

export type TaxRegime = 
  | 'new'           // Section 115BAC (Individual/HUF)
  | 'old'           // Old regime with deductions (Individual/HUF)
  | '115BAA'        // Section 115BAA (22% + 10% surcharge + 4% cess = 25.17%, no MAT)
  | 'normal_company'// Normal corporate tax (25% or 30% + surcharge + cess, MAT applies)
  | 'firm_standard';// Partnership / LLP flat 30% + surcharge (if > 1Cr) + 4% cess

export type RevenueInputType = 
  | 'gross_revenue'
  | 'profit_before_tax'
  | 'taxable_income';

export type FinancialYear = 
  | 'FY 2025-26 (AY 2026-27)'
  | 'FY 2024-25 (AY 2025-26)'
  | 'FY 2026-27 (AY 2027-28)';

export type StrategyRiskLevel = 'low' | 'balanced' | 'advanced';

export type StrategyCategory = 
  | 'operating_expenses'
  | 'depreciation_capex'
  | 'entity_regime'
  | 'employee_retirement'
  | 'statutory_compliance'
  | 'rd_incentives'
  | 'charitable_donations';

export type FundDestination = 
  | 'retained_in_asset'
  | 'retained_in_business'
  | 'paid_to_employees_pension'
  | 'external_vendor'
  | 'donation';

export interface BusinessProfile {
  id: string;
  name: string;
  financialYear: FinancialYear;
  entityType: EntityType;
  taxRegime: TaxRegime;
  revenueInputType: RevenueInputType;
  
  // Financial numbers (INR)
  grossRevenue: number;
  operatingExpenses: number;
  employeeCosts: number;
  rentAndUtilities: number;
  
  // Specific partner / director payments
  partnerRemunerationPaid: number; // for firm / LLP
  interestOnCapitalPaid: number;   // for firm / LLP up to 12%
  
  // Capital expenditure
  capitalExpenditureComputers: number; // 40% depreciation
  capitalExpenditureEquipment: number; // 15% depreciation
  capexTiming: 'before_oct_3' | 'after_oct_3'; // >= 180 days (100% rate) vs < 180 days (50% rate)
  
  // Other financial inputs
  interestAndFinancing: number;
  otherIncome: number;
  existingDeductions80Cto80U: number; // For Old Regime
  
  // Taxes already paid
  advanceTaxPaid: number;
  tdsPaid: number;
  tcsPaid: number;
  
  // Business context
  employeeCount: number;
  industry: string;
  businessAgeYears: number;
  isDpiitRecognizedStartup: boolean;
  workingCapitalReserve: number;
  state: string;
  digitalReceiptsPercentage: number; // For Section 44AD/44ADA eligibility checks
}

export interface TaxCalculationResult {
  grossRevenue: number;
  allowableOperatingExpenses: number;
  depreciationClaimed: number;
  partnerRemunerationAllowed: number;
  partnerRemunerationDisallowed: number;
  partnerInterestAllowed: number;
  
  preliminaryAccountingProfit: number; // Revenue - Operating Expenses - Depreciation
  taxAdjustments: number;
  grossTotalIncome: number;
  
  eligibleDeductions: number;
  taxableIncome: number;
  
  // Tax breakdown
  baseTax: number;
  rebate87A: number;
  surcharge: number;
  marginalRelief: number;
  cess: number; // 4%
  totalTaxLiability: number;
  
  // Minimum tax check
  minimumTax: {
    type: 'MAT' | 'AMT' | 'none';
    rate: number;
    amount: number;
    applicable: boolean;
    creditGenerated: number;
  };
  
  effectiveTaxAmount: number; // max of normal tax and minimum tax
  taxesAlreadyPaid: number;
  netTaxPayableOrRefund: number;
  effectiveTaxRate: number; // percentage
  
  // Cash & Profit analysis
  postTaxAccountingProfit: number;
  businessCashRemaining: number;
  cashAfterInvestments: number;
  estimatedPersonalTakeHome: number;
  
  auditRequiredU44AB: boolean;
  auditThresholdLimit: number;
  presumptiveEligibility: {
    eligible44AD: boolean;
    deemedProfit44AD: number;
    taxUnder44AD: number;
    eligible44ADA: boolean;
    deemedProfit44ADA: number;
    taxUnder44ADA: number;
  };
  notes: string[];
}

export interface TaxStrategy {
  id: string;
  title: string;
  category: StrategyCategory;
  riskLevel: StrategyRiskLevel;
  legalSection: string;
  description: string;
  detailedExplanation: string;
  
  eligible: boolean;
  eligibilityReason: string;
  
  // Quantitative calculations
  requiredSpending: number;
  eligibleDeduction: number;
  estimatedTaxSaved: number;
  implementationCost: number;
  netEconomicBenefit: number; // (Tax saved + Asset value created/retained) - (Outflow + Cost)
  immediateCashOutflow: number; // Spending - Tax Saved + Implementation Cost
  
  // Impact on totals
  resultingTaxableIncome: number;
  resultingTaxLiability: number;
  resultingPostTaxProfit: number;
  
  fundDestination: FundDestination;
  liquidityImpact: string;
  lockInPeriod?: string;
  risksAndLimitations: string[];
  requiredDocumentation: string[];
  officialSourceUrl: string;
  verificationDate: string;
  verificationStatus: 'verified' | 'provisional';
  incompatibleWith?: string[];
  isSelected?: boolean;
}

export interface TaxStrategyOptimizationResult {
  baselineTax: number;
  optimizedTax: number;
  totalTaxSaved: number;
  taxSavingPercentage: number;
  totalAdditionalSpending: number;
  totalImplementationCost: number;
  totalNetEconomicBenefit: number;
  netCashOutflow: number;
  postTaxProfitAfterStrategies: number;
  businessCashRemainingAfterStrategies: number;
  selectedStrategies: TaxStrategy[];
  conflictingStrategiesWarning?: string[];
}

export interface TaxCalendarEvent {
  id: string;
  title: string;
  dueDate: string;
  category: 'advance_tax' | 'itr_filing' | 'audit' | 'tds_compliance' | 'msme_payment';
  applicableEntities: EntityType[];
  description: string;
  penaltyClause: string;
  actionRequired: string;
}

export interface VerifiedTaxRule {
  id: string;
  section: string;
  title: string;
  category: string;
  applicableLaw: string;
  applicableEntities: string[];
  effectiveFinancialYear: string;
  status: 'verified' | 'provisional';
  lastVerifiedDate: string;
  summary: string;
  officialSourceUrl: string;
  statutoryLimit?: string;
}
