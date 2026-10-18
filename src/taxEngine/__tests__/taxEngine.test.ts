/**
 * TaxWise AI - Comprehensive Unit Test Suite
 * Executed via Node 22's native test runner (node --test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateIndividualNewRegimeTax,
  calculateIndividualOldRegimeTax,
  calculateFirmOrLLPTax,
  calculateCompanyTax,
  calculateTaxForEntity,
} from '../taxSlabs.ts';

import {
  calculateSection40bPartnerRemunerationLimit,
  calculateTaxDepreciation,
  calculateBusinessTax,
} from '../calculator.ts';

import {
  generateTaxStrategies,
  optimizeTaxStrategies,
} from '../strategies.ts';

import {
  SCENARIO_1_2_CRORE,
  generateEntityComparisonMatrix,
} from '../scenarios.ts';

import type { BusinessProfile } from '../types.ts';

// -------------------------------------------------------------
// 1. SLABS & REBATE 87A TESTS
// -------------------------------------------------------------
test('Individual New Regime u/s 115BAC: Nil tax up to ₹3,00,000', () => {
  const res = calculateIndividualNewRegimeTax(300000);
  assert.equal(res.baseTax, 0);
  assert.equal(res.totalTax, 0);
});

test('Individual New Regime u/s 115BAC: Section 87A Rebate makes income up to ₹7,00,000 ZERO tax', () => {
  const res = calculateIndividualNewRegimeTax(700000);
  // Base tax would be (4,00,000 * 5%) = 20,000
  // Rebate 87A provides 20,000 rebate -> total tax is 0
  assert.equal(res.rebate87A, 20000);
  assert.equal(res.totalTax, 0);
});

test('Individual New Regime u/s 115BAC: Tax on ₹12,00,000', () => {
  const res = calculateIndividualNewRegimeTax(1200000);
  // Slabs:
  // 0 - 3L: 0
  // 3L - 7L: 20,000 (4L * 5%)
  // 7L - 10L: 30,000 (3L * 10%)
  // 10L - 12L: 30,000 (2L * 15%)
  // Total base tax = 80,000
  // Cess @ 4% = 3,200
  // Total tax = 83,200
  assert.equal(res.baseTax, 80000);
  assert.equal(res.cess, 3200);
  assert.equal(res.totalTax, 83200);
});

test('Individual New Regime: Surcharge at ₹1.2 Crore with 15% rate', () => {
  const res = calculateIndividualNewRegimeTax(12000000);
  // Surcharge rate is 15% for income > 1 Cr to 2 Cr
  assert.ok(res.surcharge > 0);
  assert.ok(res.totalTax > res.baseTax);
  assert.equal(res.cess, Math.round((res.baseTax + res.surcharge) * 0.04));
});

test('Partnership & LLP: Flat 30% base rate plus 4% cess below ₹1 Crore', () => {
  const res = calculateFirmOrLLPTax(5000000); // 50 Lakhs
  // Base tax: 50L * 30% = 15,00,000
  // Surcharge: 0
  // Cess: 15L * 4% = 60,000
  // Total: 15,60,000 (effective 31.2%)
  assert.equal(res.baseTax, 1500000);
  assert.equal(res.surcharge, 0);
  assert.equal(res.cess, 60000);
  assert.equal(res.totalTax, 1560000);
  assert.equal(res.effectiveRate, 31.2);
});

test('Partnership & LLP: Surcharge 12% applies when income exceeds ₹1 Crore', () => {
  const res = calculateFirmOrLLPTax(12000000); // 1.2 Crore
  // Base tax = 1.2 Cr * 30% = 36,00,000
  assert.equal(res.baseTax, 3600000);
  assert.ok(res.surcharge > 0);
  assert.ok(res.effectiveRate > 31.2);
});

test('Domestic Company: Section 115BAA flat effective rate is 25.168%', () => {
  const res = calculateCompanyTax(10000000, '115BAA'); // 1 Crore
  // 1 Cr * 22% = 22,00,000
  // 10% surcharge = 2,20,000 -> 24,20,000
  // 4% cess = 96,800 -> 25,16,800
  assert.equal(res.baseTax, 2200000);
  assert.equal(res.surcharge, 220000);
  assert.equal(res.cess, 96800);
  assert.equal(res.totalTax, 2516800);
  assert.equal(res.effectiveRate, 25.168);
});

// -------------------------------------------------------------
// 2. SECTION 40(b) PARTNER REMUNERATION TESTS
// -------------------------------------------------------------
test('Section 40(b): First ₹3,00,000 book profit allows 90% or ₹1,50,000', () => {
  // If book profit is 2,00,000: 90% is 1,80,000 which is > 1.5L
  assert.equal(calculateSection40bPartnerRemunerationLimit(200000), 180000);

  // If book profit is 1,00,000: 90% is 90,000, but minimum is ₹1,50,000
  assert.equal(calculateSection40bPartnerRemunerationLimit(100000), 150000);

  // If book profit is 10,00,000:
  // First 3L @ 90% = 2,70,000
  // Balance 7L @ 60% = 4,20,000
  // Total = 6,90,000
  assert.equal(calculateSection40bPartnerRemunerationLimit(1000000), 690000);
});

// -------------------------------------------------------------
// 3. SECTION 32 DEPRECIATION TESTS
// -------------------------------------------------------------
test('Section 32: Computers at 40%, Put to use before Oct 3 receives 100% rate', () => {
  const depr = calculateTaxDepreciation(500000, 0, 'before_oct_3');
  // 5,00,000 * 40% = 2,00,000
  assert.equal(depr, 200000);
});

test('Section 32: Put to use after Oct 3 receives 50% rate (half-year rule)', () => {
  const depr = calculateTaxDepreciation(500000, 0, 'after_oct_3');
  // 5,00,000 * 40% * 0.5 = 1,00,000
  assert.equal(depr, 100000);
});

// -------------------------------------------------------------
// 4. REVENUE VS PROFIT VS TAXABLE INCOME SEPARATION
// -------------------------------------------------------------
test('Business Calculator: Correctly computes accounting profit vs taxable profit', () => {
  const profile: BusinessProfile = {
    id: 'test_1',
    name: 'Test Tech Services',
    financialYear: 'FY 2025-26 (AY 2026-27)',
    entityType: 'proprietorship',
    taxRegime: 'new',
    revenueInputType: 'gross_revenue',
    grossRevenue: 10000000, // 1 Crore
    operatingExpenses: 2500000,
    employeeCosts: 3500000,
    rentAndUtilities: 500000,
    partnerRemunerationPaid: 0,
    interestOnCapitalPaid: 0,
    capitalExpenditureComputers: 500000, // 40% depr = 2,00,000
    capitalExpenditureEquipment: 0,
    capexTiming: 'before_oct_3',
    interestAndFinancing: 100000,
    otherIncome: 0,
    existingDeductions80Cto80U: 0,
    advanceTaxPaid: 200000,
    tdsPaid: 150000,
    tcsPaid: 0,
    employeeCount: 5,
    industry: 'Software Consulting',
    businessAgeYears: 3,
    isDpiitRecognizedStartup: false,
    workingCapitalReserve: 1000000,
    state: 'Karnataka',
    digitalReceiptsPercentage: 99,
  };

  const result = calculateBusinessTax(profile);

  // Allowable base expenses: 25L + 35L + 5L + 1L = 66,00,000
  assert.equal(result.grossRevenue, 10000000);
  assert.equal(result.allowableOperatingExpenses, 6600000);
  assert.equal(result.depreciationClaimed, 200000);

  // Preliminary Accounting Profit: 1 Cr - 66L - 2L depr = 32,00,000
  assert.equal(result.preliminaryAccountingProfit, 3200000);
  assert.equal(result.taxableIncome, 3200000);

  // Taxable Income must NOT equal Gross Revenue!
  assert.notEqual(result.taxableIncome, result.grossRevenue);

  // Taxes paid deduction
  assert.equal(result.taxesAlreadyPaid, 350000);
  assert.ok(result.totalTaxLiability > 0);
  assert.equal(result.netTaxPayableOrRefund, result.totalTaxLiability - 350000);

  // Post-tax accounting profit
  assert.equal(result.postTaxAccountingProfit, result.preliminaryAccountingProfit - result.totalTaxLiability);
});

// -------------------------------------------------------------
// 5. ₹1.2 CRORE DEMONSTRATION SCENARIO TESTS (PHASE 9)
// -------------------------------------------------------------
test('₹1.2 Crore Demo Scenario computes valid baseline and entity comparison', () => {
  const result = calculateBusinessTax(SCENARIO_1_2_CRORE);

  assert.equal(result.grossRevenue, 12000000);
  assert.ok(result.preliminaryAccountingProfit > 0);
  assert.ok(result.taxableIncome > 0);
  assert.ok(result.totalTaxLiability > 0);

  // Verify entity comparison matrix produces 6 valid legal options
  const matrix = generateEntityComparisonMatrix(SCENARIO_1_2_CRORE);
  assert.equal(matrix.length, 6);

  for (const row of matrix) {
    assert.equal(row.revenue, 12000000);
    assert.ok(row.taxableIncome > 0);
    assert.ok(row.baselineTax > 0);
    assert.ok(row.effectiveTaxRate > 0);
    assert.ok(row.postTaxProfit > 0);
    assert.ok(row.complianceOverhead.length > 0);
    assert.ok(row.caveats.length > 0);
  }
});

// -------------------------------------------------------------
// 6. STRATEGY ENGINE TESTS
// -------------------------------------------------------------
test('Strategy Engine generates eligible strategies with quantified net benefits', () => {
  const strategies = generateTaxStrategies(SCENARIO_1_2_CRORE);
  assert.ok(strategies.length >= 5);

  const eligibleStrats = strategies.filter(s => s.eligible);
  assert.ok(eligibleStrats.length >= 3);

  for (const strat of eligibleStrats) {
    assert.ok(strat.title.length > 0);
    assert.ok(strat.legalSection.length > 0);
    assert.ok(strat.officialSourceUrl.startsWith('http'));
    assert.ok(strat.risksAndLimitations.length > 0);
    assert.ok(strat.requiredDocumentation.length > 0);
  }

  // Optimize selected strategies
  const selectedIds = eligibleStrats.slice(0, 3).map(s => s.id);
  const optimization = optimizeTaxStrategies(SCENARIO_1_2_CRORE, selectedIds);

  assert.ok(optimization.totalTaxSaved > 0);
  assert.ok(optimization.taxSavingPercentage > 0);
  assert.equal(optimization.baselineTax, calculateBusinessTax(SCENARIO_1_2_CRORE).totalTaxLiability);
  assert.ok(optimization.optimizedTax < optimization.baselineTax);
});
