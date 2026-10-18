/**
 * Core Indian Business Tax Calculator Engine
 * Accurately models Revenue -> Accounting Profit -> Tax Adjustments -> Taxable Income -> Tax Liability -> Cash Flow
 */

import type { BusinessProfile, TaxCalculationResult } from './types.ts';
import { calculateTaxForEntity } from './taxSlabs.ts';

/**
 * Computes allowable partner remuneration under Section 40(b) of Income-tax Act, 1961
 * For Firms and LLPs:
 * - On first ₹3,00,000 of book profit (or in case of a loss): ₹1,50,000 or 90% of book profit, whichever is more
 * - On the balance of book profit: 60% of book profit
 */
export function calculateSection40bPartnerRemunerationLimit(bookProfitBeforeRemuneration: number): number {
  if (bookProfitBeforeRemuneration <= 0) {
    return 150000; // minimum statutory allowance even in loss
  }

  if (bookProfitBeforeRemuneration <= 300000) {
    return Math.max(150000, bookProfitBeforeRemuneration * 0.90);
  }

  // Above 3 Lakhs:
  // First 3 Lakhs @ 90% = 2,70,000 (which is > 1.5L)
  // Balance @ 60%
  const firstTier = 300000 * 0.90; // 270,000
  const balance = (bookProfitBeforeRemuneration - 300000) * 0.60;
  return firstTier + balance;
}

/**
 * Computes Section 32 Income Tax Depreciation
 * - Computers & Software: 40% WDV
 * - Plant & Equipment: 15% WDV
 * - Put to use >= 180 days: 100% of rate
 * - Put to use < 180 days (after Oct 3): 50% of rate
 */
export function calculateTaxDepreciation(
  computersCapex: number,
  equipmentCapex: number,
  capexTiming: 'before_oct_3' | 'after_oct_3'
): number {
  const rateFactor = capexTiming === 'before_oct_3' ? 1.0 : 0.5;

  const computersDepreciation = (computersCapex * 0.40) * rateFactor;
  const equipmentDepreciation = (equipmentCapex * 0.15) * rateFactor;

  return Math.round(computersDepreciation + equipmentDepreciation);
}

/**
 * Executes full tax and financial computation for a business profile
 */
export function calculateBusinessTax(profile: BusinessProfile): TaxCalculationResult {
  const notes: string[] = [];

  // 1. Establish Gross Revenue & Base Operating Expenses
  let grossRevenue = Math.max(0, profile.grossRevenue);
  let operatingExpenses = Math.max(0, profile.operatingExpenses);
  let employeeCosts = Math.max(0, profile.employeeCosts);
  let rentAndUtilities = Math.max(0, profile.rentAndUtilities);
  let interestAndFinancing = Math.max(0, profile.interestAndFinancing);
  let otherIncome = Math.max(0, profile.otherIncome);

  // If user entered 'profit_before_tax' or 'taxable_income' as starting input,
  // reconcile inputs gracefully without inventing unrealistic zero expenses
  if (profile.revenueInputType === 'profit_before_tax') {
    grossRevenue = Math.max(0, profile.grossRevenue);
    // If expenses were not provided, assume realistic baseline
    if (operatingExpenses === 0 && employeeCosts === 0) {
      operatingExpenses = Math.round(grossRevenue * 0.35);
      employeeCosts = Math.round(grossRevenue * 0.25);
    }
  }

  // 2. Compute Depreciation
  const depreciationClaimed = calculateTaxDepreciation(
    profile.capitalExpenditureComputers || 0,
    profile.capitalExpenditureEquipment || 0,
    profile.capexTiming || 'before_oct_3'
  );

  if (profile.capitalExpenditureComputers > 0 || profile.capitalExpenditureEquipment > 0) {
    if (profile.capexTiming === 'after_oct_3') {
      notes.push('Capex acquired after Oct 3 received 50% of statutory depreciation rate (put to use < 180 days). The remaining 50% will be available in year 2.');
    }
  }

  // 3. Allowable Operating Expenses (excluding partner remuneration for now)
  const totalBaseExpenses = operatingExpenses + employeeCosts + rentAndUtilities + interestAndFinancing;

  // 4. Partner Remuneration & Interest Handling (for Partnership & LLP)
  let partnerRemunerationAllowed = 0;
  let partnerRemunerationDisallowed = 0;
  let partnerInterestAllowed = 0;

  if (profile.entityType === 'partnership' || profile.entityType === 'llp') {
    // Book profit before remuneration = Revenue + otherIncome - baseExpenses - depreciation
    const bookProfitBeforeRemuneration = Math.max(
      0,
      grossRevenue + otherIncome - totalBaseExpenses - depreciationClaimed
    );
    const statutoryMaxRemuneration = calculateSection40bPartnerRemunerationLimit(bookProfitBeforeRemuneration);

    const actualRemunerationPaid = profile.partnerRemunerationPaid || 0;
    if (actualRemunerationPaid <= statutoryMaxRemuneration) {
      partnerRemunerationAllowed = actualRemunerationPaid;
      partnerRemunerationDisallowed = 0;
    } else {
      partnerRemunerationAllowed = statutoryMaxRemuneration;
      partnerRemunerationDisallowed = actualRemunerationPaid - statutoryMaxRemuneration;
      notes.push(`Partner remuneration of ₹${partnerRemunerationDisallowed.toLocaleString('en-IN')} exceeded the Section 40(b) ceiling of ₹${statutoryMaxRemuneration.toLocaleString('en-IN')} and was disallowed / added back to firm taxable profit.`);
    }

    // Partner interest on capital allowed up to 12% p.a.
    partnerInterestAllowed = profile.interestOnCapitalPaid || 0;
  }

  const allowableOperatingExpenses = totalBaseExpenses + partnerRemunerationAllowed + partnerInterestAllowed;

  // 5. Preliminary Accounting Profit
  const preliminaryAccountingProfit = Math.round(
    grossRevenue + otherIncome - totalBaseExpenses - (profile.partnerRemunerationPaid || 0) - (profile.interestOnCapitalPaid || 0) - depreciationClaimed
  );

  // 6. Tax Adjustments (Disallowances added back)
  const taxAdjustments = partnerRemunerationDisallowed;

  // 7. Gross Total Income
  const grossTotalIncome = Math.max(
    0,
    grossRevenue + otherIncome - allowableOperatingExpenses - depreciationClaimed + taxAdjustments
  );

  // 8. Deductions under Chapter VI-A
  let eligibleDeductions = 0;
  if (profile.entityType === 'proprietorship') {
    if (profile.taxRegime === 'old') {
      // Old regime allows 80C (max 1.5L), 80D, 80G, etc.
      eligibleDeductions = Math.min(grossTotalIncome, profile.existingDeductions80Cto80U || 0);
    } else {
      // New regime disallows regular 80C/80D; notes this
      if (profile.existingDeductions80Cto80U > 0) {
        notes.push('Deductions under Section 80C/80D are not allowable under the New Tax Regime (Section 115BAC). Opt for the Old Regime if your deductions exceed tax savings under New Regime slabs.');
      }
      eligibleDeductions = 0;
    }
  } else if (profile.entityType === 'pvt_ltd' || profile.entityType === 'public_ltd') {
    if (profile.taxRegime === '115BAA') {
      // Section 115BAA foregoes general Chapter VI-A deductions except 80JJAA/80M
      eligibleDeductions = 0;
    }
  }

  // 9. Taxable Income
  const taxableIncome = Math.max(0, grossTotalIncome - eligibleDeductions);

  // 10. Base Tax, Surcharge, Marginal Relief, Cess
  const slabResult = calculateTaxForEntity(
    profile.entityType,
    profile.taxRegime,
    taxableIncome,
    grossRevenue
  );

  // 11. Minimum Alternate Tax (MAT) / Alternative Minimum Tax (AMT) check
  let minimumTax = {
    type: 'none' as 'MAT' | 'AMT' | 'none',
    rate: 0,
    amount: 0,
    applicable: false,
    creditGenerated: 0,
  };

  if ((profile.entityType === 'pvt_ltd' || profile.entityType === 'public_ltd') && profile.taxRegime === 'normal_company') {
    // MAT u/s 115JB: 15% + surcharge + cess on Book Profit
    const matBase = Math.max(0, preliminaryAccountingProfit) * 0.15;
    const matSurchargeRate = preliminaryAccountingProfit > 100000000 ? 0.12 : preliminaryAccountingProfit > 10000000 ? 0.07 : 0;
    const matSurcharge = matBase * matSurchargeRate;
    const matCess = (matBase + matSurcharge) * 0.04;
    const matTotal = Math.round(matBase + matSurcharge + matCess);

    if (matTotal > slabResult.totalTax) {
      minimumTax = {
        type: 'MAT',
        rate: 15,
        amount: matTotal,
        applicable: true,
        creditGenerated: matTotal - slabResult.totalTax,
      };
      notes.push(`MAT under Section 115JB (₹${matTotal.toLocaleString('en-IN')}) exceeds regular corporate tax. MAT credit of ₹${(matTotal - slabResult.totalTax).toLocaleString('en-IN')} generated (carried forward up to 15 years).`);
    }
  } else if (profile.entityType === 'llp') {
    // AMT u/s 115JC: 18.5% on Adjusted Total Income if deductions claimed
    if (eligibleDeductions > 0) {
      const amtBase = (taxableIncome + eligibleDeductions) * 0.185;
      const amtSurcharge = taxableIncome > 10000000 ? amtBase * 0.12 : 0;
      const amtCess = (amtBase + amtSurcharge) * 0.04;
      const amtTotal = Math.round(amtBase + amtSurcharge + amtCess);

      if (amtTotal > slabResult.totalTax) {
        minimumTax = {
          type: 'AMT',
          rate: 18.5,
          amount: amtTotal,
          applicable: true,
          creditGenerated: amtTotal - slabResult.totalTax,
        };
        notes.push(`AMT under Section 115JC (₹${amtTotal.toLocaleString('en-IN')}) applies due to claimed deductions.`);
      }
    }
  }

  const finalTaxAmount = minimumTax.applicable ? minimumTax.amount : slabResult.totalTax;

  // 12. Taxes already paid offset
  const advanceTaxPaid = profile.advanceTaxPaid || 0;
  const tdsPaid = profile.tdsPaid || 0;
  const tcsPaid = profile.tcsPaid || 0;
  const taxesAlreadyPaid = advanceTaxPaid + tdsPaid + tcsPaid;
  const netTaxPayableOrRefund = finalTaxAmount - taxesAlreadyPaid;

  // 13. Effective Tax Rate
  const effectiveTaxRate = taxableIncome > 0
    ? Number(((finalTaxAmount / taxableIncome) * 100).toFixed(2))
    : 0;

  // 14. Post-Tax Accounting Profit
  const postTaxAccountingProfit = preliminaryAccountingProfit - finalTaxAmount;

  // 15. Business Cash Flow
  // Total cash received = Revenue + Other Income - Advance Tax & TDS paid
  // Cash paid = Operating expenses + Employee costs + Rent + Interest + Partner Remuneration paid + Capex Outflow + Balance Tax payable (if due)
  const totalCapexSpent = (profile.capitalExpenditureComputers || 0) + (profile.capitalExpenditureEquipment || 0);
  const actualCashExpenses = totalBaseExpenses + (profile.partnerRemunerationPaid || 0) + (profile.interestOnCapitalPaid || 0);
  const businessCashRemaining = Math.round(
    grossRevenue + otherIncome - actualCashExpenses - finalTaxAmount
  );
  const cashAfterInvestments = businessCashRemaining - totalCapexSpent;

  // 16. Estimated Personal Take-Home
  let estimatedPersonalTakeHome = 0;
  if (profile.entityType === 'proprietorship') {
    // Proprietor take-home is post-tax business profit (no corporate distribution tax)
    estimatedPersonalTakeHome = postTaxAccountingProfit;
  } else if (profile.entityType === 'partnership' || profile.entityType === 'llp') {
    // Partners take home: Remuneration + Interest + Tax-exempt profit share u/s 10(2A)
    // Less individual tax on remuneration
    const partnerTaxOnSalary = calculateTaxForEntity('proprietorship', 'new', partnerRemunerationAllowed + partnerInterestAllowed).totalTax;
    estimatedPersonalTakeHome = (partnerRemunerationAllowed + partnerInterestAllowed - partnerTaxOnSalary) + postTaxAccountingProfit;
  } else {
    // Company: Post-tax profit can be retained or paid as dividend (dividend taxed at shareholder slab rate, approx 30% average)
    estimatedPersonalTakeHome = Math.round(postTaxAccountingProfit * 0.70);
  }

  // 17. Tax Audit Threshold under Section 44AB
  // Business limit: ₹1 Crore (or ₹10 Crore if digital receipts >= 95%)
  const isEligibleDigitalThreshold = (profile.digitalReceiptsPercentage || 0) >= 95;
  const auditThresholdLimit = isEligibleDigitalThreshold ? 100000000 : 10000000;
  const auditRequiredU44AB = grossRevenue > auditThresholdLimit;

  // 18. Presumptive Taxation Section 44AD / 44ADA Checks
  const eligible44AD = profile.entityType === 'proprietorship' || profile.entityType === 'partnership'
    ? (grossRevenue <= (isEligibleDigitalThreshold ? 30000000 : 20000000))
    : false;
  // 6% on digital, 8% on non-digital
  const digitalShare = (profile.digitalReceiptsPercentage || 80) / 100;
  const deemedProfit44AD = eligible44AD
    ? Math.round(grossRevenue * (digitalShare * 0.06 + (1 - digitalShare) * 0.08))
    : 0;
  const taxUnder44AD = eligible44AD
    ? calculateTaxForEntity(profile.entityType, profile.taxRegime, deemedProfit44AD).totalTax
    : 0;

  const eligible44ADA = (profile.entityType === 'proprietorship' || profile.entityType === 'partnership')
    && grossRevenue <= (isEligibleDigitalThreshold ? 7500000 : 5000000);
  const deemedProfit44ADA = eligible44ADA ? Math.round(grossRevenue * 0.50) : 0;
  const taxUnder44ADA = eligible44ADA
    ? calculateTaxForEntity(profile.entityType, profile.taxRegime, deemedProfit44ADA).totalTax
    : 0;

  return {
    grossRevenue,
    allowableOperatingExpenses,
    depreciationClaimed,
    partnerRemunerationAllowed,
    partnerRemunerationDisallowed,
    partnerInterestAllowed,
    preliminaryAccountingProfit,
    taxAdjustments,
    grossTotalIncome,
    eligibleDeductions,
    taxableIncome,
    baseTax: slabResult.baseTax,
    rebate87A: slabResult.rebate87A,
    surcharge: slabResult.surcharge,
    marginalRelief: slabResult.marginalRelief,
    cess: slabResult.cess,
    totalTaxLiability: slabResult.totalTax,
    minimumTax,
    effectiveTaxAmount: finalTaxAmount,
    taxesAlreadyPaid,
    netTaxPayableOrRefund,
    effectiveTaxRate,
    postTaxAccountingProfit,
    businessCashRemaining,
    cashAfterInvestments,
    estimatedPersonalTakeHome,
    auditRequiredU44AB,
    auditThresholdLimit,
    presumptiveEligibility: {
      eligible44AD,
      deemedProfit44AD,
      taxUnder44AD,
      eligible44ADA,
      deemedProfit44ADA,
      taxUnder44ADA,
    },
    notes,
  };
}
