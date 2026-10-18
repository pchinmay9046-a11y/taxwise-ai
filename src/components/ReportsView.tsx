import React, { useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  CheckCircle2,
  FileText,
  Share2,
  Building2,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult, TaxStrategy } from '../taxEngine/types.ts';
import { optimizeTaxStrategies } from '../taxEngine/strategies.ts';
import { formatINR, formatPercent } from '../utils/formatters.ts';

interface ReportsViewProps {
  profile: BusinessProfile;
  calculation: TaxCalculationResult;
  selectedStrategyIds: string[];
  allStrategies: TaxStrategy[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  calculation,
  selectedStrategyIds,
  allStrategies,
}) => {
  const [copied, setCopied] = useState(false);
  const optimization = optimizeTaxStrategies(profile, selectedStrategyIds);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ['TaxWise AI - Indian Business Tax Planning & Optimization Report'],
      ['Generated On', new Date().toLocaleDateString('en-IN')],
      ['Business Name', profile.name],
      ['Financial Year', profile.financialYear],
      ['Legal Entity Type', profile.entityType],
      ['Tax Regime', profile.taxRegime],
      [''],
      ['FINANCIAL SUMMARY (INR)'],
      ['Gross Annual Revenue', calculation.grossRevenue],
      ['Allowable Operating Expenses', calculation.allowableOperatingExpenses],
      ['Section 32 Depreciation', calculation.depreciationClaimed],
      ['Preliminary Accounting Profit (PBT)', calculation.preliminaryAccountingProfit],
      ['Tax Adjustments / Disallowances', calculation.taxAdjustments],
      ['Net Taxable Income', calculation.taxableIncome],
      [''],
      ['TAX LIABILITY & OPTIMIZATION'],
      ['Estimated Baseline Tax', optimization.baselineTax],
      ['Estimated Tax with Strategies', optimization.optimizedTax],
      ['Total Tax Reduction', optimization.totalTaxSaved],
      ['Tax Saving Percentage', `${optimization.taxSavingPercentage}%`],
      ['Total Additional Spending Required', optimization.totalAdditionalSpending],
      ['Implementation / Compliance Costs', optimization.totalImplementationCost],
      ['Net Economic Benefit', optimization.totalNetEconomicBenefit],
      ['Immediate Net Cash Outflow', optimization.netCashOutflow],
      ['Post-Tax Profit Remaining', optimization.postTaxProfitAfterStrategies],
      [''],
      ['SELECTED TAX-SAVING STRATEGIES'],
      ['Strategy Name', 'Legal Section', 'Tax Saved (INR)', 'Spending (INR)', 'Net Benefit (INR)'],
      ...optimization.selectedStrategies.map(s => [
        s.title,
        s.legalSection,
        s.estimatedTaxSaved,
        s.requiredSpending,
        s.netEconomicBenefit
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaxWise_AI_Report_${profile.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = `TAXWISE AI - BUSINESS TAX REPORT
Business: ${profile.name} (${profile.entityType.toUpperCase()})
FY: ${profile.financialYear}
Gross Revenue: ${formatINR(calculation.grossRevenue)}
Accounting Profit: ${formatINR(calculation.preliminaryAccountingProfit)}
Taxable Income: ${formatINR(calculation.taxableIncome)}
Baseline Tax: ${formatINR(optimization.baselineTax)}
Optimized Tax: ${formatINR(optimization.optimizedTax)}
Total Tax Saved: ${formatINR(optimization.totalTaxSaved)} (${optimization.taxSavingPercentage}% reduction)
Net Economic Benefit: ${formatINR(optimization.totalNetEconomicBenefit)}
Active Strategies (${optimization.selectedStrategies.length}):
${optimization.selectedStrategies.map(s => `- ${s.title} (${s.legalSection}): Saves ${formatINR(s.estimatedTaxSaved)}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Phase 13 Comprehensive Exports
            </span>
            <span className="text-xs text-slate-500">• Ready for Chartered Accountant Review</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Audit-Ready Business Tax Report
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Export or print your complete tax planning dossier with statutory references and computation statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Summary' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-slate-900">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">TaxWise AI</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Official Report
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Business Tax Planning & Optimization Memorandum
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5">
            <span className="text-slate-500 block">Date of Assessment: {new Date().toLocaleDateString('en-IN')}</span>
            <span className="font-bold text-slate-800 block">Assessment Year: {profile.financialYear}</span>
            <span className="text-slate-500 block">Jurisdiction: Income Tax Department, India</span>
          </div>
        </div>

        {/* Business Profile Details */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Business Name:</span>
            <strong className="text-slate-900">{profile.name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Legal Structure:</span>
            <strong className="text-slate-900 capitalize">{profile.entityType.replace('_', ' ')}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Tax Regime:</span>
            <strong className="text-slate-900">{profile.taxRegime}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Industry Sector:</span>
            <strong className="text-slate-900">{profile.industry}</strong>
          </div>
        </div>

        {/* Financial Reconciliation Section */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            1. Financial Summary & Taxable Income Determination
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Line Item</th>
                  <th className="py-2.5 px-4">Statutory Reference</th>
                  <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-4 font-semibold">Gross Commercial Revenue</td>
                  <td className="py-2 px-4 text-slate-500">Gross Turnover / Invoicing Receipts</td>
                  <td className="py-2 px-4 text-right font-bold">{formatINR(calculation.grossRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold">Less: Operating & Employee Costs</td>
                  <td className="py-2 px-4 text-slate-500">Section 37(1) allowable business expenditure</td>
                  <td className="py-2 px-4 text-right text-rose-700">-{formatINR(calculation.allowableOperatingExpenses)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-semibold">Less: Section 32 Depreciation</td>
                  <td className="py-2 px-4 text-slate-500">Computers (40%) & Machinery (15%)</td>
                  <td className="py-2 px-4 text-right text-rose-700">-{formatINR(calculation.depreciationClaimed)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2 px-4 text-emerald-800">Preliminary Accounting Profit (PBT)</td>
                  <td className="py-2 px-4 text-slate-500">Pre-tax business profit</td>
                  <td className="py-2 px-4 text-right text-emerald-800">{formatINR(calculation.preliminaryAccountingProfit)}</td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="py-2.5 px-4">Net Statutory Taxable Income</td>
                  <td className="py-2.5 px-4 text-slate-300">Base for income tax assessment</td>
                  <td className="py-2.5 px-4 text-right text-emerald-400">{formatINR(calculation.taxableIncome)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Tax Strategies Section */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            2. Recommended & Selected Tax-Saving Strategies
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-4">Strategy Title</th>
                  <th className="py-2.5 px-4">Statutory Section</th>
                  <th className="py-2.5 px-4 text-right">Spending Required</th>
                  <th className="py-2.5 px-4 text-right">Tax Saved</th>
                  <th className="py-2.5 px-4 text-right">Net Benefit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {optimization.selectedStrategies.length > 0 ? (
                  optimization.selectedStrategies.map(strat => (
                    <tr key={strat.id}>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{strat.title}</td>
                      <td className="py-2.5 px-4 text-slate-600">{strat.legalSection}</td>
                      <td className="py-2.5 px-4 text-right text-slate-800">{formatINR(strat.requiredSpending)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{formatINR(strat.estimatedTaxSaved)}</td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-teal-800">{formatINR(strat.netEconomicBenefit)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No strategies selected. Open the Tax Saving Planner to select eligible options.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optimization Summary */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3 text-xs">
          <h3 className="font-bold text-emerald-950 uppercase tracking-wider">
            3. Final Optimization Outcomes & Cash Retained
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 block">Baseline Tax:</span>
              <strong className="text-slate-900 text-sm">{formatINR(optimization.baselineTax)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Optimized Tax:</span>
              <strong className="text-emerald-700 text-sm font-extrabold">{formatINR(optimization.optimizedTax)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Tax Saved:</span>
              <strong className="text-emerald-700 text-sm">{formatINR(optimization.totalTaxSaved)} ({optimization.taxSavingPercentage}%)</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Net Economic Benefit:</span>
              <strong className="text-teal-800 text-sm font-extrabold">{formatINR(optimization.totalNetEconomicBenefit)}</strong>
            </div>
          </div>
        </div>

        {/* Official Statutory Disclaimer */}
        <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-4 leading-relaxed">
          <p>
            <strong>Statutory Disclaimer:</strong> This report is generated by TaxWise AI for financial modeling and tax optimization purposes under the Income-tax Act, 1961, and Finance Acts. Computations assume accurate user entries. Actual filing requires validation of invoices, form certifications (such as Form 10DA, Form 10-IC, or Form 3CD), and submission by a practicing Chartered Accountant.
          </p>
        </div>

      </div>

    </div>
  );
};
