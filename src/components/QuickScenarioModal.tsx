import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Layers,
  RotateCcw,
  Building2,
  DollarSign
} from 'lucide-react';
import type { BusinessProfile } from '../taxEngine/types.ts';
import {
  generateQuickScenario,
  type QuickScenarioPreset,
  type QuickScenarioResult
} from '../taxEngine/quickActionsEngine.ts';
import { formatINR, formatPercent } from '../utils/formatters.ts';

interface QuickScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onApplyScenario: (simulatedProfile: BusinessProfile) => void;
  onNavigateToSimulator: () => void;
}

const PRESET_OPTIONS: { id: QuickScenarioPreset; label: string; badge: string; icon: string }[] = [
  {
    id: 'revenue_surge_25',
    label: 'Revenue Surge (+25%)',
    badge: 'Growth Sensitivity',
    icon: '🚀',
  },
  {
    id: 'capex_blitz_5l',
    label: 'Tech Capex Blitz (+₹5 Lakhs)',
    badge: 'Sec 32 Depreciation',
    icon: '💻',
  },
  {
    id: 'corporate_nps_shift',
    label: 'Corporate NPS Restructuring',
    badge: 'Sec 80CCD(2)',
    icon: '🛡️',
  },
  {
    id: 'regime_switch',
    label: 'Regime Switch Arbitrage',
    badge: '115BAC / 115BAA',
    icon: '⚖️',
  },
  {
    id: 'max_partner_remuneration',
    label: 'Max Partner Remuneration',
    badge: 'Sec 40(b) Ceiling',
    icon: '👥',
  },
];

export const QuickScenarioModal: React.FC<QuickScenarioModalProps> = ({
  isOpen,
  onClose,
  profile,
  onApplyScenario,
  onNavigateToSimulator,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<QuickScenarioPreset>('capex_blitz_5l');

  if (!isOpen) return null;

  const result: QuickScenarioResult = generateQuickScenario(profile, selectedPreset);

  const handleApply = () => {
    onApplyScenario(result.simulatedProfile);
    onClose();
  };

  const handleOpenSimulator = () => {
    onApplyScenario(result.simulatedProfile);
    onClose();
    onNavigateToSimulator();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-scenario-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="quick-scenario-title" className="text-lg font-bold tracking-tight text-white">
                  Quick What-If Scenario Launcher
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Instant Simulation
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simulate revenue shifts, capex write-offs, or regime arbitrage with instant Before vs After delta.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector Tabs */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Select Instant Scenario Preset
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PRESET_OPTIONS.map(opt => {
              const isSelected = selectedPreset === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSelectedPreset(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-base mb-1">{opt.icon}</span>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{opt.label}</div>
                  <span className="text-[9px] text-indigo-700 font-semibold mt-0.5">{opt.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Active Scenario Results */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Active Preset Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  {result.badge}
                </span>
                <h3 className="text-base font-bold text-slate-900">{result.title}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">{result.description}</p>
            </div>
          </div>

          {/* Delta Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Metric 1: Tax Liability */}
            <div className={`p-4 rounded-2xl border transition ${
              result.taxDiff <= 0 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-semibold">Tax Liability</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                  result.taxDiff <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {result.taxDiff <= 0 ? `Saves ${formatINR(Math.abs(result.taxDiff))}` : `+${formatINR(result.taxDiff)}`}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(result.simulatedCalculation.totalTaxLiability)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {formatINR(result.baselineCalculation.totalTaxLiability)}
              </div>
            </div>

            {/* Metric 2: Post-Tax Profit */}
            <div className={`p-4 rounded-2xl border transition ${
              result.profitDiff >= 0 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : 'bg-amber-50/50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-semibold">Post-Tax Profit</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                  result.profitDiff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {result.profitDiff >= 0 ? `+${formatINR(result.profitDiff)}` : `-${formatINR(Math.abs(result.profitDiff))}`}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(result.simulatedCalculation.postTaxAccountingProfit)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {formatINR(result.baselineCalculation.postTaxAccountingProfit)}
              </div>
            </div>

            {/* Metric 3: Retained Cash */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-semibold">Available Cash</span>
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                  {result.cashDiff >= 0 ? `+${formatINR(result.cashDiff)}` : `-${formatINR(Math.abs(result.cashDiff))}`}
                </span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(result.simulatedCalculation.businessCashRemaining)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {formatINR(result.baselineCalculation.businessCashRemaining)}
              </div>
            </div>

          </div>

          {/* Key Insights & Statutory Rules */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Statutory Analysis & Tax Drivers</span>
            </h4>
            <ul className="space-y-1.5 pt-1">
              {result.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 44AB Tax Audit Check Note */}
          {result.simulatedCalculation.auditRequiredU44AB !== result.baselineCalculation.auditRequiredU44AB && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tax Audit Alert</strong>: In this simulated scenario, your business{' '}
                {result.simulatedCalculation.auditRequiredU44AB ? 'becomes subject to' : 'becomes exempt from'}{' '}
                mandatory Tax Audit under Section 44AB (limit: {formatINR(result.simulatedCalculation.auditThresholdLimit)}).
              </span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleOpenSimulator}
              className="px-4 py-2 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Fine-Tune in Full Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to Dashboard</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
