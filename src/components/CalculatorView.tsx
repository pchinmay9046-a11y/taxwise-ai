import React from 'react';
import {
  Calculator,
  Minus,
  Plus,
  Equal,
  HelpCircle,
  FileSpreadsheet,
  ArrowDown,
  Info,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult } from '../taxEngine/types.ts';
import { formatINR, formatPercent } from '../utils/formatters.ts';

interface CalculatorViewProps {
  profile: BusinessProfile;
  calculation: TaxCalculationResult;
  onOpenWizard: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  profile,
  calculation,
  onOpenWizard,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase 5 Computation Engine
              </span>
              <span className="text-xs text-slate-500">• Full Statutory Audit Trail</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Taxable Income & Liability Computation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step reconciliation separating Gross Turnover, Accounting Profit, and Statutory Taxable Income.
            </p>
          </div>

          <button
            onClick={onOpenWizard}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            Adjust Financial Inputs
          </button>
        </div>
      </div>

      {/* Main Computation Waterfall */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Official Tax Computation Statement — {profile.financialYear}
            </h2>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {profile.entityType.toUpperCase().replace('_', ' ')} ({profile.taxRegime.toUpperCase()})
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          
          {/* Row 1: Gross Revenue */}
          <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>1. Gross Business Revenue (Turnover)</span>
              </div>
              <p className="text-slate-500">
                Total commercial invoicing receipts before operating expenses
              </p>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {formatINR(calculation.grossRevenue)}
            </span>
          </div>

          {/* Row 2: Allowable Operating Expenses */}
          <div className="p-4 sm:px-6 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-rose-700">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                <span>2. Allowable Operating & Employee Expenses</span>
              </div>
              <p className="text-slate-500">
                Payroll ({formatINR(profile.employeeCosts)}), Rent & Utilities ({formatINR(profile.rentAndUtilities)}), Vendor & SaaS ({formatINR(profile.operatingExpenses)})
              </p>
            </div>
            <span className="text-sm font-bold text-rose-700">
              -{formatINR(calculation.allowableOperatingExpenses)}
            </span>
          </div>

          {/* Row 3: Section 32 Depreciation */}
          <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-rose-700">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                <span>3. Depreciation under Section 32</span>
              </div>
              <p className="text-slate-500">
                Computers & Software (40% WDV) + Plant/Machinery (15% WDV) • Put to use: {profile.capexTiming}
              </p>
            </div>
            <span className="text-sm font-bold text-rose-700">
              -{formatINR(calculation.depreciationClaimed)}
            </span>
          </div>

          {/* Row 4: Accounting Profit */}
          <div className="p-4 sm:px-6 flex items-center justify-between bg-emerald-50/40 font-bold">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-emerald-800">
                <Equal className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>4. Preliminary Accounting Profit (PBT)</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-normal">
                Financial profit of the business before tax adjustments
              </p>
            </div>
            <span className="text-base text-emerald-800">
              {formatINR(calculation.preliminaryAccountingProfit)}
            </span>
          </div>

          {/* Row 5: Tax Adjustments & Disallowances */}
          {calculation.taxAdjustments > 0 && (
            <div className="p-4 sm:px-6 flex items-center justify-between bg-amber-50/30">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>5. Statutory Tax Adjustments (Disallowances Added Back)</span>
                </div>
                <p className="text-slate-500">
                  Section 40(b) partner remuneration disallowed in excess of book profit limits
                </p>
              </div>
              <span className="text-sm font-bold text-amber-800">
                +{formatINR(calculation.taxAdjustments)}
              </span>
            </div>
          )}

          {/* Row 6: Deductions under Chapter VI-A */}
          <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-slate-700">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                <span>6. Eligible Deductions (Chapter VI-A / 80JJAA)</span>
              </div>
              <p className="text-slate-500">
                {profile.taxRegime === 'new' 
                  ? 'General 80C/80D not allowable in New Regime Section 115BAC' 
                  : profile.taxRegime === '115BAA' 
                  ? 'Corporate Section 115BAA foregoes general VI-A deductions' 
                  : `Claimed allowances: ${formatINR(calculation.eligibleDeductions)}`}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-800">
              -{formatINR(calculation.eligibleDeductions)}
            </span>
          </div>

          {/* Row 7: Net Taxable Income */}
          <div className="p-4 sm:px-6 flex items-center justify-between bg-slate-900 text-white font-bold">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Equal className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="text-emerald-400">7. Net Statutory Taxable Income</span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                Base income subject to applicable entity tax slabs/rates
              </p>
            </div>
            <span className="text-lg text-white">
              {formatINR(calculation.taxableIncome)}
            </span>
          </div>

          {/* Row 8: Base Income Tax */}
          <div className="p-4 sm:px-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">8. Base Income Tax on Taxable Income</span>
              <p className="text-slate-500">
                Computed using statutory slabs/rates for {profile.entityType}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {formatINR(calculation.baseTax)}
            </span>
          </div>

          {/* Row 9: Section 87A Rebate */}
          {calculation.rebate87A > 0 && (
            <div className="p-4 sm:px-6 flex items-center justify-between bg-emerald-50/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <Minus className="w-3.5 h-3.5 shrink-0" />
                  <span>9. Section 87A Tax Rebate</span>
                </div>
                <p className="text-slate-500">
                  100% tax rebate for individual taxable income up to ₹7,00,000 under New Regime
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-700">
                -{formatINR(calculation.rebate87A)}
              </span>
            </div>
          )}

          {/* Row 10: Surcharge */}
          <div className="p-4 sm:px-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>10. Statutory Surcharge</span>
              </div>
              <p className="text-slate-500">
                {calculation.surcharge > 0 
                  ? `Applicable high-income surcharge (Marginal relief applied: ${formatINR(calculation.marginalRelief)})` 
                  : 'Nil (Income below surcharge threshold)'}
              </p>
            </div>
            <span className="text-sm font-bold text-slate-800">
              +{formatINR(calculation.surcharge)}
            </span>
          </div>

          {/* Row 11: 4% Health & Education Cess */}
          <div className="p-4 sm:px-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>11. Health & Education Cess (4%)</span>
              </div>
              <p className="text-slate-500">
                4% levied on total of (Base Tax + Surcharge - Marginal Relief)
              </p>
            </div>
            <span className="text-sm font-bold text-slate-800">
              +{formatINR(calculation.cess)}
            </span>
          </div>

          {/* Row 12: Total Tax Liability */}
          <div className="p-4 sm:px-6 flex items-center justify-between bg-amber-50/60 font-bold">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-amber-900">
                <Equal className="w-4 h-4 shrink-0 text-amber-700" />
                <span>12. Total Tax Liability</span>
              </div>
              <p className="text-[11px] text-amber-800 font-normal">
                Effective Tax Rate: {formatPercent(calculation.effectiveTaxRate)}
              </p>
            </div>
            <span className="text-base text-amber-900">
              {formatINR(calculation.totalTaxLiability)}
            </span>
          </div>

          {/* Row 13: Taxes Already Paid (Advance Tax & TDS) */}
          <div className="p-4 sm:px-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-700">
                <Minus className="w-3.5 h-3.5 shrink-0" />
                <span>13. Taxes Already Paid (TDS, TCS & Advance Tax)</span>
              </div>
              <p className="text-slate-500">
                Advance Tax ({formatINR(profile.advanceTaxPaid)}) + TDS ({formatINR(profile.tdsPaid)}) + TCS ({formatINR(profile.tcsPaid)})
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-700">
              -{formatINR(calculation.taxesAlreadyPaid)}
            </span>
          </div>

          {/* Row 14: Net Balance Tax Payable / Refund */}
          <div className={`p-4 sm:px-6 flex items-center justify-between font-extrabold text-sm ${
            calculation.netTaxPayableOrRefund > 0 
              ? 'bg-rose-50 text-rose-900' 
              : 'bg-emerald-50 text-emerald-900'
          }`}>
            <div className="space-y-0.5">
              <span>14. Net Balance {calculation.netTaxPayableOrRefund > 0 ? 'Tax Payable' : 'Refund Due'}</span>
              <p className="text-[11px] font-normal text-slate-600">
                {calculation.netTaxPayableOrRefund > 0 
                  ? 'Must be deposited before March 15 (Advance tax) or ITR filing' 
                  : 'Excess TDS will be credited to your verified bank account'}
              </p>
            </div>
            <span className="text-lg">
              {formatINR(Math.abs(calculation.netTaxPayableOrRefund))}
            </span>
          </div>

        </div>
      </div>

      {/* Cash Flow Reconciliation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Post-Tax Business Profit & Cash Flow Reconciliation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Post-Tax Accounting Profit</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {formatINR(calculation.postTaxAccountingProfit)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              PBT minus statutory tax liability
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Business Cash Remaining</span>
            <span className="text-lg font-bold text-emerald-700 mt-1 block">
              {formatINR(calculation.businessCashRemaining)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Revenue minus cash expenses & taxes paid
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Owner / Partner Take-Home</span>
            <span className="text-lg font-bold text-teal-700 mt-1 block">
              {formatINR(calculation.estimatedPersonalTakeHome)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {profile.entityType === 'proprietorship' ? 'Direct proprietor drawings' : profile.entityType === 'llp' ? 'Remuneration & exempt profit share' : 'Net dividend distribution pool'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
