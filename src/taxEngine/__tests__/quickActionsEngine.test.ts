/**
 * TaxWise AI - Quick Actions Engine Unit Tests
 * Native Node 22 test runner (node --test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateExpenseTaxImpact,
  applyExpenseToProfile,
  generateQuickScenario,
} from '../quickActionsEngine.ts';

import { SCENARIO_1_2_CRORE } from '../scenarios.ts';

test('Quick Actions: Operating Expense delivers 100% deduction and saves tax', () => {
  const impact = calculateExpenseTaxImpact(SCENARIO_1_2_CRORE, {
    category: 'operating_expense',
    amount: 100000, // 1 Lakh
    description: 'Cloud Server Infrastructure',
  });

  assert.equal(impact.immediateDeduction, 100000);
  assert.ok(impact.taxSaved > 0);
  assert.equal(impact.netCashCost, 100000 - impact.taxSaved);
  assert.ok(impact.newTax < impact.baselineTax);
  assert.equal(impact.statutorySection, 'Section 37(1)');
});

test('Quick Actions: Computers Capex before Oct 3 provides 40% immediate deduction', () => {
  const impact = calculateExpenseTaxImpact(SCENARIO_1_2_CRORE, {
    category: 'computers_capex',
    amount: 500000, // 5 Lakhs
    description: 'Engineering MacBooks',
    capexTiming: 'before_oct_3',
  });

  assert.equal(impact.immediateDeduction, 200000); // 40% of 5L = 2L
  assert.ok(impact.taxSaved > 0);
  assert.equal(impact.netCashCost, 500000 - impact.taxSaved);
});

test('Quick Actions: Computers Capex after Oct 3 provides half-rate 20% immediate deduction', () => {
  const impact = calculateExpenseTaxImpact(SCENARIO_1_2_CRORE, {
    category: 'computers_capex',
    amount: 500000, // 5 Lakhs
    description: 'Engineering MacBooks',
    capexTiming: 'after_oct_3',
  });

  assert.equal(impact.immediateDeduction, 100000); // 20% of 5L = 1L
  assert.ok(impact.taxSaved > 0);
});

test('Quick Actions: applyExpenseToProfile correctly mutates financial categories', () => {
  const baseExpenses = SCENARIO_1_2_CRORE.operatingExpenses;
  const updated1 = applyExpenseToProfile(SCENARIO_1_2_CRORE, {
    category: 'operating_expense',
    amount: 50000,
    description: 'Marketing Retainer',
  });
  assert.equal(updated1.operatingExpenses, baseExpenses + 50000);

  const baseCapex = SCENARIO_1_2_CRORE.capitalExpenditureComputers;
  const updated2 = applyExpenseToProfile(SCENARIO_1_2_CRORE, {
    category: 'computers_capex',
    amount: 200000,
    description: 'New Servers',
    capexTiming: 'before_oct_3',
  });
  assert.equal(updated2.capitalExpenditureComputers, baseCapex + 200000);
});

test('Quick Actions: generateQuickScenario handles revenue surge and capex blitz presets', () => {
  const surge = generateQuickScenario(SCENARIO_1_2_CRORE, 'revenue_surge_25');
  assert.equal(surge.preset, 'revenue_surge_25');
  assert.equal(surge.simulatedProfile.grossRevenue, SCENARIO_1_2_CRORE.grossRevenue * 1.25);
  assert.ok(surge.keyInsights.length > 0);

  const capex = generateQuickScenario(SCENARIO_1_2_CRORE, 'capex_blitz_5l');
  assert.equal(capex.preset, 'capex_blitz_5l');
  assert.equal(
    capex.simulatedProfile.capitalExpenditureComputers,
    SCENARIO_1_2_CRORE.capitalExpenditureComputers + 500000
  );
  assert.ok(capex.taxDiff <= 0); // tax liability reduced
});
