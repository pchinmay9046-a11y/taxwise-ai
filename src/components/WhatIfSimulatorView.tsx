import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  DollarSign
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult } from '../taxEngine/types.ts';
import { calculateBusinessTax } from '../taxEngine/calculator.ts';
import { formatINR, formatCompactINR, formatPercent } from '../utils/formatters.ts';

interface WhatIfSimulatorViewProps {
  baseProfile: BusinessProfile;
  baseCalculation: TaxCalculationResult;
  onApplySimulatedToProfile: (simulatedProfile: BusinessProfile) => void;
}

export const WhatIfSimulatorView: React.FC<WhatIfSimulatorViewProps> = ({
  baseProfile,
  baseCalculation,
  onApplySimulatedToProfile,
}) => {
  const [simProfile, setSimProfile] = useState<BusinessProfile>({ ...baseProfile });

  const updateSim = (field: keyof BusinessProfile, val: any) => {
    setSimProfile(prev => ({ ...prev, [field]: val }));
  };

  const simCalculation = calculateBusinessTax(simProfile);

  // Variances
  const taxDiff = simCalculation.totalTaxLiability - baseCalculation.totalTaxLiability;
  const profitDiff = simCalculation.postTaxAccountingProfit - baseCalculation.postTaxAccountingProfit;
  const cashDiff = simCalculation.businessCashRemaining - baseCalculation.businessCashRemaining;

  const handleReset = () => {
    setSimProfile({ ...baseProfile });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Phase 10 Interactive Simulation
              </span>
              <span className="text-xs text-slate-500">• Real-Time Sensitivity Engine</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Live What-If Tax Scenario Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Adjust sliders dynamically to simulate changes in revenue, operating expenses, employee hiring, and Section 32 capital investments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Base</span>
            </button>
            <button
              onClick={() => onApplySimulatedToProfile(simProfile)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Save as Active Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Difference Metric Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulated Tax Liability</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatINR(simCalculation.totalTaxLiability)}</span>
            <span className={`text-xs font-bold ${taxDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {taxDiff <= 0 ? `-${formatINR(Math.abs(taxDiff))}` : `+${formatINR(taxDiff)}`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline: {formatINR(baseCalculation.totalTaxLiability)} ({formatPercent(simCalculation.effectiveTaxRate)} eff. rate)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post-Tax Accounting Profit</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatINR(simCalculation.postTaxAccountingProfit)}</span>
            <span className={`text-xs font-bold ${profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {profitDiff >= 0 ? `+${formatINR(profitDiff)}` : `-${formatINR(Math.abs(profitDiff))}`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline: {formatINR(baseCalculation.postTaxAccountingProfit)}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retained Business Cash</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-700">{formatINR(simCalculation.businessCashRemaining)}</span>
            <span className={`text-xs font-bold ${cashDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {cashDiff >= 0 ? `+${formatINR(cashDiff)}` : `-${formatINR(Math.abs(cashDiff))}`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Baseline: {formatINR(baseCalculation.businessCashRemaining)}
          </span>
        </div>

      </div>

      {/* Simulator Control Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Dynamic Variable Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Slider 1: Gross Revenue */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Gross Annual Revenue:</span>
              <span className="text-slate-900 font-extrabold text-sm">{formatINR(simProfile.grossRevenue)}</span>
            </div>
            <input
              type="range"
              min={1000000}
              max={50000000}
              step={200000}
              value={simProfile.grossRevenue}
              onChange={(e) => updateSim('grossRevenue', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹10 Lakh</span>
              <span>₹2.5 Crore</span>
              <span>₹5.0 Crore</span>
            </div>
          </div>

          {/* Slider 2: Operating Expenses */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Operating Expenses (SaaS, Rent, Utilities):</span>
              <span className="text-slate-900 font-extrabold text-sm">{formatINR(simProfile.operatingExpenses)}</span>
            </div>
            <input
              type="range"
              min={200000}
              max={25000000}
              step={100000}
              value={simProfile.operatingExpenses}
              onChange={(e) => updateSim('operatingExpenses', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹2 Lakh</span>
              <span>₹1.2 Crore</span>
              <span>₹2.5 Crore</span>
            </div>
          </div>

          {/* Slider 3: Employee Costs */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Employee Costs & Wages:</span>
              <span className="text-slate-900 font-extrabold text-sm">{formatINR(simProfile.employeeCosts)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20000000}
              step={100000}
              value={simProfile.employeeCosts}
              onChange={(e) => updateSim('employeeCosts', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹0</span>
              <span>₹1.0 Crore</span>
              <span>₹2.0 Crore</span>
            </div>
          </div>

          {/* Slider 4: Capital Expenditure Computers (Sec 32) */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Section 32 Computer Capex (40% Depr):</span>
              <span className="text-emerald-700 font-extrabold text-sm">{formatINR(simProfile.capitalExpenditureComputers)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000000}
              step={50000}
              value={simProfile.capitalExpenditureComputers}
              onChange={(e) => updateSim('capitalExpenditureComputers', Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹0</span>
              <span>₹25 Lakh</span>
              <span>₹50 Lakh</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
