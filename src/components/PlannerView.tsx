import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Info,
  Sliders,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import type { BusinessProfile, TaxStrategy, TaxStrategyOptimizationResult, StrategyRiskLevel, StrategyCategory } from '../taxEngine/types.ts';
import { optimizeTaxStrategies } from '../taxEngine/strategies.ts';
import { formatINR, formatPercent, formatCompactINR } from '../utils/formatters.ts';

interface PlannerViewProps {
  profile: BusinessProfile;
  allStrategies: TaxStrategy[];
  selectedStrategyIds: string[];
  onToggleStrategy: (id: string) => void;
  onSelectMultiple: (ids: string[]) => void;
  onClearStrategies: () => void;
  onOpenAssistant: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  profile,
  allStrategies,
  selectedStrategyIds,
  onToggleStrategy,
  onSelectMultiple,
  onClearStrategies,
  onOpenAssistant,
}) => {
  const [riskFilter, setRiskFilter] = useState<'all' | StrategyRiskLevel>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | StrategyCategory>('all');
  const [activeStrategyModal, setActiveStrategyModal] = useState<TaxStrategy | null>(null);

  // Compute live optimization result
  const optimization: TaxStrategyOptimizationResult = optimizeTaxStrategies(profile, selectedStrategyIds);

  // Filtered strategies
  const filteredStrategies = allStrategies.filter(strat => {
    if (riskFilter !== 'all' && strat.riskLevel !== riskFilter) return false;
    if (categoryFilter !== 'all' && strat.category !== categoryFilter) return false;
    return true;
  });

  // Quick preset bundles
  const applyLowRiskBundle = () => {
    const lowRiskIds = allStrategies.filter(s => s.eligible && s.riskLevel === 'low').map(s => s.id);
    onSelectMultiple(lowRiskIds);
  };

  const applyMaxBenefitBundle = () => {
    // Pick high net economic benefit compatible strategies
    const sorted = [...allStrategies]
      .filter(s => s.eligible && s.netEconomicBenefit > 0)
      .sort((a, b) => b.netEconomicBenefit - a.netEconomicBenefit);
    const chosenIds: string[] = [];
    const incompatible = new Set<string>();

    for (const s of sorted) {
      if (!incompatible.has(s.id)) {
        chosenIds.push(s.id);
        if (s.incompatibleWith) {
          s.incompatibleWith.forEach(id => incompatible.add(id));
        }
      }
    }
    onSelectMultiple(chosenIds);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Bundle Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase 6 & 8 Strategy Engine
              </span>
              <span className="text-xs text-slate-500">• 100% Legitimate Indian Tax Provisions</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Intelligent Tax Saving Planner
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Select verified strategies to model real-time tax savings, cash expenditure, and post-tax business profit.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={applyLowRiskBundle}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              Apply Low Risk Bundle
            </button>
            <button
              onClick={applyMaxBenefitBundle}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimal Benefit Bundle</span>
            </button>
            {selectedStrategyIds.length > 0 && (
              <button
                onClick={onClearStrategies}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Conflicting Strategies Warning */}
        {optimization.conflictingStrategiesWarning && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Mutual Exclusivity Notice</span>
            </div>
            {optimization.conflictingStrategiesWarning.map((warn, i) => (
              <p key={i} className="pl-5 text-amber-800">{warn}</p>
            ))}
          </div>
        )}
      </div>

      {/* Prominent Results Summary Dashboard (Phase 7 Requirement) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Tax Saving & Economic Impact Analysis
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {selectedStrategyIds.length} Strategies Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Estimated Tax Before</span>
            <span className="text-xl font-bold text-slate-100 mt-1 block">
              {formatINR(optimization.baselineTax)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold block">Estimated Tax After</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
              {formatINR(optimization.optimizedTax)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Total Tax Reduced</span>
            <span className="text-xl font-bold text-emerald-300 mt-1 block">
              {formatINR(optimization.totalTaxSaved)}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {optimization.taxSavingPercentage}% tax reduction
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Net Economic Benefit</span>
            <span className="text-xl font-bold text-teal-300 mt-1 block">
              {formatINR(optimization.totalNetEconomicBenefit)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Tax saved minus compliance fees
            </span>
          </div>

        </div>

        {/* Phase 7 Explicit Cash Flow Transparency Grid */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Additional Capital/Spending:</span>
            <strong className="text-slate-200 text-sm">{formatINR(optimization.totalAdditionalSpending)}</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Physical assets, payroll, or business SaaS</p>
          </div>

          <div>
            <span className="text-slate-400 block">Immediate Net Cash Outflow:</span>
            <strong className="text-amber-300 text-sm">{formatINR(optimization.netCashOutflow)}</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Spending minus immediate tax saved</p>
          </div>

          <div>
            <span className="text-slate-400 block">Post-Tax Profit Remaining:</span>
            <strong className="text-emerald-300 text-sm">{formatINR(optimization.postTaxProfitAfterStrategies)}</strong>
            <p className="text-[11px] text-slate-400 mt-0.5">Accounting profit retained after tax</p>
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        
        {/* Risk Level Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1">Risk:</span>
          {(['all', 'low', 'balanced', 'advanced'] as const).map(risk => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                riskFilter === risk
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>

        {/* Category Filter Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Categories ({allStrategies.length})</option>
            <option value="operating_expenses">Operating Expenses</option>
            <option value="depreciation_capex">Depreciation & Capex (Sec 32)</option>
            <option value="employee_retirement">Employee & Retirement</option>
            <option value="entity_regime">Entity & Tax Regime (115BAA/40(b))</option>
            <option value="statutory_compliance">Statutory Safeguards (43B(h))</option>
            <option value="rd_incentives">Research & Development (Sec 35)</option>
            <option value="charitable_donations">Charitable Donations (80G)</option>
          </select>
        </div>

      </div>

      {/* Strategy Cards List */}
      <div className="space-y-4">
        {filteredStrategies.map((strat) => {
          const isSelected = selectedStrategyIds.includes(strat.id);
          const isEligible = strat.eligible;

          return (
            <div
              key={strat.id}
              className={`rounded-2xl border p-5 transition ${
                isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                  : isEligible
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left: Strategy Info & Details */}
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    id={`checkbox-${strat.id}`}
                    checked={isSelected}
                    disabled={!isEligible}
                    onChange={() => onToggleStrategy(strat.id)}
                    className="w-5 h-5 mt-1 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-white">
                        {strat.legalSection}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        strat.riskLevel === 'low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : strat.riskLevel === 'balanced'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {strat.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        Verified: {strat.verificationDate}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <label htmlFor={`checkbox-${strat.id}`} className="cursor-pointer hover:text-emerald-700">
                        {strat.title}
                      </label>
                    </h3>

                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {strat.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className={`inline-flex items-center gap-1 font-semibold ${isEligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {strat.eligibilityReason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Financial Impact Metrics */}
                <div className="lg:text-right shrink-0 bg-slate-50 lg:bg-transparent p-3 lg:p-0 rounded-xl border lg:border-none border-slate-200">
                  <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Estimated Tax Saved</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {formatINR(strat.estimatedTaxSaved)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Net Economic Benefit</span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatINR(strat.netEconomicBenefit)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Required Outlay</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatINR(strat.requiredSpending)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setActiveStrategyModal(strat)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 font-semibold bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                    >
                      Legal & Doc Checklist
                    </button>
                    {isEligible && (
                      <button
                        onClick={() => onToggleStrategy(strat.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          isSelected
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Comprehensive Strategy Detail Modal */}
      {activeStrategyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 shadow-2xl space-y-5">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeStrategyModal.legalSection}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {activeStrategyModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveStrategyModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Detailed Legal Explanation</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeStrategyModal.detailedExplanation}
              </p>
            </div>

            {/* Quantitative Breakdown Table */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Required Spending:</span>
                <strong className="text-slate-800">{formatINR(activeStrategyModal.requiredSpending)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Eligible Tax Deduction:</span>
                <strong className="text-slate-800">{formatINR(activeStrategyModal.eligibleDeduction)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Tax Saved:</span>
                <strong className="text-emerald-700 font-bold">{formatINR(activeStrategyModal.estimatedTaxSaved)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Compliance Cost:</span>
                <strong className="text-slate-800">{formatINR(activeStrategyModal.implementationCost)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Immediate Cash Outflow:</span>
                <strong className="text-amber-700 font-semibold">{formatINR(activeStrategyModal.immediateCashOutflow)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Net Economic Benefit:</span>
                <strong className="text-teal-700 font-bold">{formatINR(activeStrategyModal.netEconomicBenefit)}</strong>
              </div>
            </div>

            {/* Required Documentation */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Required Documentation for Tax Audit</h4>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                {activeStrategyModal.requiredDocumentation.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks & Limitations */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Statutory Caveats & Restrictions</h4>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                {activeStrategyModal.risksAndLimitations.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Source Link */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <a
                href={activeStrategyModal.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <span>Official Income Tax Department Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  onToggleStrategy(activeStrategyModal.id);
                  setActiveStrategyModal(null);
                }}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs ${
                  selectedStrategyIds.includes(activeStrategyModal.id)
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedStrategyIds.includes(activeStrategyModal.id) ? 'Remove Strategy' : 'Select Strategy'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
