import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PiggyBank,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Zap,
  Receipt,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult, TaxStrategy } from '../taxEngine/types.ts';
import { formatINR, formatCompactINR, formatPercent } from '../utils/formatters.ts';
import { QuickActionsFloatingMenu } from './QuickActionsFloatingMenu.tsx';
import { QuickExpenseModal } from './QuickExpenseModal.tsx';
import { QuickScenarioModal } from './QuickScenarioModal.tsx';
import type { LoggedExpense } from '../taxEngine/quickActionsEngine.ts';

interface DashboardViewProps {
  profile: BusinessProfile;
  calculation: TaxCalculationResult;
  allStrategies: TaxStrategy[];
  selectedStrategyIds: string[];
  onToggleStrategy: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenAssistant: (initialPrompt?: string) => void;
  onOpenWizard: () => void;
  onUpdateProfile: (updatedProfile: BusinessProfile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  calculation,
  allStrategies,
  selectedStrategyIds,
  onToggleStrategy,
  onNavigateTab,
  onOpenAssistant,
  onOpenWizard,
  onUpdateProfile,
}) => {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [loggedExpenses, setLoggedExpenses] = useState<LoggedExpense[]>([]);
  const eligibleStrategies = allStrategies.filter(s => s.eligible);
  const selectedStrategies = eligibleStrategies.filter(s => selectedStrategyIds.includes(s.id));
  
  // Calculate simulated tax with selected strategies
  const totalTaxSaved = selectedStrategies.reduce((acc, s) => acc + s.estimatedTaxSaved, 0);
  const optimizedTax = Math.max(0, calculation.totalTaxLiability - totalTaxSaved);
  const taxSavingsPct = calculation.totalTaxLiability > 0 
    ? (totalTaxSaved / calculation.totalTaxLiability) * 100 
    : 0;

  // Working capital liquidity ratio
  const liquidityRatio = profile.workingCapitalReserve > 0
    ? (calculation.businessCashRemaining / profile.workingCapitalReserve) * 100
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Profile Header & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 rounded-2xl p-6 text-white border border-slate-700/80 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {profile.entityType.toUpperCase().replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                • {profile.financialYear} • {profile.state}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {profile.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Industry: <strong className="text-slate-100">{profile.industry}</strong> • Current Regime:{' '}
              <strong className="text-slate-100">
                {profile.taxRegime === 'new' ? 'Section 115BAC (New Regime)' : profile.taxRegime === '115BAA' ? 'Section 115BAA (25.17% Concessional)' : profile.taxRegime}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={() => setScenarioModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Run Scenario</span>
            </button>
            <button
              onClick={() => onOpenAssistant()}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Chat AI</span>
            </button>
            <button
              onClick={onOpenWizard}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition shadow-xs"
            >
              Edit Profile
            </button>
            <button
              onClick={() => onNavigateTab('planner')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <PiggyBank className="w-4 h-4" />
              <span>Open Tax Planner</span>
            </button>
          </div>
        </div>

        {/* Phase 9 Explicit Clarification Alert */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-300">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Indian Tax Distinction</strong>: Revenue of <strong>{formatINR(profile.grossRevenue)}</strong> is gross receipts. Your income tax is calculated on <strong>Taxable Income ({formatINR(calculation.taxableIncome)})</strong> after allowable operating expenses and Section 32 depreciation.
          </span>
        </div>
      </div>

      {/* Main KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Annual Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatINR(calculation.grossRevenue)}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Turnover before operating expenses
          </p>
        </div>

        {/* KPI 2: Accounting Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounting Profit (PBT)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatINR(calculation.preliminaryAccountingProfit)}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            After {formatINR(calculation.allowableOperatingExpenses)} operating costs & {formatINR(calculation.depreciationClaimed)} depr.
          </p>
        </div>

        {/* KPI 3: Baseline Tax Liability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Tax (Baseline)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatINR(calculation.totalTaxLiability)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mt-1">
            <span>Effective Rate: {formatPercent(calculation.effectiveTaxRate)}</span>
            <span>• Advance tax paid: {formatINR(calculation.taxesAlreadyPaid)}</span>
          </div>
        </div>

        {/* KPI 4: Potential Tax Savings */}
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Potential Tax Reduction</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-emerald-700">
              {totalTaxSaved > 0 ? formatINR(totalTaxSaved) : formatINR(eligibleStrategies.reduce((acc, s) => acc + s.estimatedTaxSaved, 0))}
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">
            {selectedStrategies.length > 0 
              ? `${selectedStrategies.length} selected strategies (${taxSavingsPct.toFixed(1)}% reduction)`
              : `Up to ${eligibleStrategies.length} verified legal strategies available`}
          </p>
        </div>

      </div>

      {/* Visual Comparison: Before vs After Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Tax & Cash Flow Impact Comparison */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Before & After Tax Planning Impact</h2>
              <p className="text-xs text-slate-500">
                Comparison of tax liability, post-tax profit, and retained business cash
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
            >
              <span>Manage Strategies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-5 pt-2">
            
            {/* Metric 1: Tax Liability Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Tax Payable (Lower is Better)</span>
                <span className="text-emerald-600 font-bold">
                  {totalTaxSaved > 0 ? `Saves ${formatINR(totalTaxSaved)} (${taxSavingsPct.toFixed(1)}%)` : 'Baseline Tax'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Baseline (Current)</span>
                  <span className="text-base font-bold text-slate-900">{formatINR(calculation.totalTaxLiability)}</span>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-medium block">With Selected Strategies</span>
                  <span className="text-base font-bold text-emerald-800">{formatINR(optimizedTax)}</span>
                  <div className="w-full bg-emerald-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, (optimizedTax / (calculation.totalTaxLiability || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric 2: Post-Tax Business Profit */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700">Post-Tax Accounting Profit (Higher is Better)</span>
                <span className="text-emerald-600 font-bold">
                  {formatINR(calculation.postTaxAccountingProfit + totalTaxSaved)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Baseline Profit</span>
                  <span className="text-base font-bold text-slate-800">{formatINR(calculation.postTaxAccountingProfit)}</span>
                </div>
                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 font-medium block">Optimized Profit</span>
                  <span className="text-base font-bold text-emerald-800">
                    {formatINR(calculation.postTaxAccountingProfit + totalTaxSaved)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 3: Retained Cash Flow */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Estimated Personal Take-Home</span>
                  <span className="text-slate-500">
                    {profile.entityType === 'proprietorship' ? 'Direct post-tax proprietor income' : profile.entityType === 'llp' || profile.entityType === 'partnership' ? 'Partner remuneration + exempt profit share' : 'Corporate profit after dividend provision'}
                  </span>
                </div>
              </div>
              <div className="text-right sm:shrink-0">
                <span className="text-base font-extrabold text-slate-900 block">
                  {formatINR(calculation.estimatedPersonalTakeHome + totalTaxSaved)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Col: Liquidity Safeguard & Compliance Status */}
        <div className="space-y-4">
          
          {/* Working Capital Reserve Gauge */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Working Capital Liquidity</h3>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Target Reserve:</span>
                <span className="font-semibold text-slate-800">{formatINR(profile.workingCapitalReserve)}</span>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">Available Business Cash:</span>
                <span className="font-bold text-emerald-700">{formatINR(calculation.businessCashRemaining)}</span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    liquidityRatio >= 100 ? 'bg-emerald-500' : liquidityRatio >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, liquidityRatio)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {liquidityRatio >= 100 
                  ? 'Healthy: Business cash comfortably exceeds your working capital reserve threshold.'
                  : 'Caution: Retained cash is below your target working capital safety margin.'}
              </p>
            </div>
          </div>

          {/* Section 44AB Tax Audit Check */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tax Audit Status (Sec 44AB)</h3>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${calculation.auditRequiredU44AB ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="text-xs font-semibold text-slate-800">
                  {calculation.auditRequiredU44AB ? 'Tax Audit Mandatory' : 'Audit Exempt (Under Limit)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Turnover threshold limit: {formatINR(calculation.auditThresholdLimit)} ({profile.digitalReceiptsPercentage >= 95 ? '95%+ Digital Threshold: ₹10 Cr' : 'Standard: ₹1 Cr'}).
              </p>
              {calculation.auditRequiredU44AB && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                  Audit report (Form 3CD) must be signed and submitted by Chartered Accountant before <strong>Sept 30</strong>.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recommended Strategies Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Verified Legal Tax-Saving Recommendations</h2>
            <p className="text-xs text-slate-500">
              Ranked by net economic benefit, statutory eligibility confidence, and business liquidity impact
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('planner')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All {eligibleStrategies.length} Options</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eligibleStrategies.slice(0, 3).map((strat) => {
            const isSelected = selectedStrategyIds.includes(strat.id);
            return (
              <div
                key={strat.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {strat.legalSection.split('&')[0]}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      strat.riskLevel === 'low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : strat.riskLevel === 'balanced'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {strat.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{strat.title}</h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{strat.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Estimated Tax Saved:</span>
                    <strong className="text-emerald-700">{formatINR(strat.estimatedTaxSaved)}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Net Economic Benefit:</span>
                    <strong className="text-slate-900">{formatINR(strat.netEconomicBenefit)}</strong>
                  </div>

                  <button
                    onClick={() => onToggleStrategy(strat.id)}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{isSelected ? 'Applied to Plan' : 'Apply to Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Floating Speed Dial Menu on Dashboard */}
      <QuickActionsFloatingMenu
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onOpenAssistant={onOpenAssistant}
        onNavigateTab={onNavigateTab}
        baselineTax={calculation.totalTaxLiability}
        totalTaxSaved={totalTaxSaved}
      />

      {/* Direct Quick Action Modals for Header Triggers */}
      <QuickExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        profile={profile}
        onProfileUpdated={onUpdateProfile}
        loggedExpenses={loggedExpenses}
        setLoggedExpenses={setLoggedExpenses}
      />

      <QuickScenarioModal
        isOpen={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
        profile={profile}
        onApplyScenario={onUpdateProfile}
        onNavigateToSimulator={() => onNavigateTab('simulator')}
      />

    </div>
  );
};
