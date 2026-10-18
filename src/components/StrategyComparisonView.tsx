import React from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingDown,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { BusinessProfile } from '../taxEngine/types.ts';
import { generateEntityComparisonMatrix } from '../taxEngine/scenarios.ts';
import { formatINR, formatPercent } from '../utils/formatters.ts';

interface StrategyComparisonViewProps {
  profile: BusinessProfile;
  onSelectEntityAndRegime: (entityType: any, regime: any) => void;
}

export const StrategyComparisonView: React.FC<StrategyComparisonViewProps> = ({
  profile,
  onSelectEntityAndRegime,
}) => {
  const comparisonRows = generateEntityComparisonMatrix(profile);

  // Find entity structure with lowest baseline tax
  const lowestTaxRow = [...comparisonRows].sort((a, b) => a.baselineTax - b.baselineTax)[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Phase 9 Statutory Comparison
          </span>
          <span className="text-xs text-slate-500">• Equal Economic Footing</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Entity Structure & Tax Regime Comparison Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Evaluates how your exact financial numbers ({formatINR(profile.grossRevenue)} revenue, {formatINR(profile.operatingExpenses + profile.employeeCosts)} expenses) perform under every major Indian legal business structure.
        </p>
      </div>

      {/* Highlight Card: Optimal Structure */}
      {lowestTaxRow && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                Lowest Tax Entity
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                Saves {formatINR(Math.max(0, comparisonRows[0].baselineTax - lowestTaxRow.baselineTax))} vs baseline
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {lowestTaxRow.entityLabel}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Effective Tax Rate: <strong>{formatPercent(lowestTaxRow.effectiveTaxRate)}</strong> • Retains <strong>{formatINR(lowestTaxRow.postTaxProfit)}</strong> in post-tax business profit.
            </p>
          </div>

          <button
            onClick={() => onSelectEntityAndRegime(lowestTaxRow.entityType, lowestTaxRow.regime)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
          >
            <span>Switch to this Structure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Entity Structure & Regime</th>
                <th className="py-3.5 px-4 text-right">Taxable Income</th>
                <th className="py-3.5 px-4 text-right">Baseline Tax</th>
                <th className="py-3.5 px-4 text-right">Effective Rate</th>
                <th className="py-3.5 px-4 text-right">Post-Tax Profit</th>
                <th className="py-3.5 px-4 text-right">Owner Take-Home</th>
                <th className="py-3.5 px-4">Audit Requirement</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row, index) => {
                const isCurrent = profile.entityType === row.entityType && profile.taxRegime === row.regime;
                const isBest = row.entityLabel === lowestTaxRow?.entityLabel;

                return (
                  <tr
                    key={index}
                    className={`hover:bg-slate-50 transition ${
                      isCurrent ? 'bg-emerald-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{row.entityLabel}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            CURRENT
                          </span>
                        )}
                        {isBest && !isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                            LOWEST TAX
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-normal text-slate-500 block mt-1">
                        {row.complianceOverhead}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-800">
                      {formatINR(row.taxableIncome)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatINR(row.baselineTax)}
                    </td>

                    <td className="py-4 px-4 text-right font-semibold text-emerald-700">
                      {formatPercent(row.effectiveTaxRate)}
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-800">
                      {formatINR(row.postTaxProfit)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-teal-800">
                      {formatINR(row.personalTakeHome)}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        row.statutoryAuditRequired ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {row.statutoryAuditRequired ? 'Mandatory Audit' : 'Audit Exempt'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-emerald-700">Active</span>
                      ) : (
                        <button
                          onClick={() => onSelectEntityAndRegime(row.entityType, row.regime)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
