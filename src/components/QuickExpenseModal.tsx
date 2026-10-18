import React, { useState } from 'react';
import {
  X,
  Receipt,
  Laptop,
  Wrench,
  Users,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Building2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { BusinessProfile } from '../taxEngine/types.ts';
import {
  calculateExpenseTaxImpact,
  applyExpenseToProfile,
  type QuickExpenseCategory,
  type QuickExpenseInput,
  type LoggedExpense
} from '../taxEngine/quickActionsEngine.ts';
import { formatINR } from '../utils/formatters.ts';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessProfile;
  onProfileUpdated: (updatedProfile: BusinessProfile) => void;
  loggedExpenses: LoggedExpense[];
  setLoggedExpenses: React.Dispatch<React.SetStateAction<LoggedExpense[]>>;
}

const CATEGORIES: {
  id: QuickExpenseCategory;
  label: string;
  section: string;
  rateLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'operating_expense',
    label: 'Operating Expense',
    section: 'Sec 37(1)',
    rateLabel: '100% deduction',
    icon: Receipt,
    description: 'SaaS, cloud hosting, marketing, office expenses, legal & accounting retainer.',
  },
  {
    id: 'computers_capex',
    label: 'IT & Computers Capex',
    section: 'Sec 32',
    rateLabel: '40% depr.',
    icon: Laptop,
    description: 'Laptops, desktops, server hardware, enterprise system software.',
  },
  {
    id: 'equipment_capex',
    label: 'Machinery & Equipment',
    section: 'Sec 32',
    rateLabel: '15% depr.',
    icon: Wrench,
    description: 'Office fixtures, electrical setups, testing gear, commercial equipment.',
  },
  {
    id: 'corporate_nps',
    label: 'Corporate NPS (Sec 80CCD2)',
    section: 'Sec 36/80CCD(2)',
    rateLabel: '100% business deduction',
    icon: ShieldCheck,
    description: 'Employer contribution into employee retirement pension; exempt from standard 80C limit.',
  },
  {
    id: 'employee_cost',
    label: 'Payroll & Wages',
    section: 'Sec 37(1)',
    rateLabel: '100% deduction',
    icon: Users,
    description: 'Staff salaries, developer retainers, contractor stipends, performance bonuses.',
  },
];

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000, 500000];

const SUGGESTED_DESCRIPTIONS: Record<QuickExpenseCategory, string[]> = {
  operating_expense: ['AWS Cloud Infrastructure', 'Google Workspace & SaaS Stack', 'Legal & Tax Audit Retainer', 'Digital Marketing Campaign'],
  computers_capex: ['Apple MacBook Pro for Engineering', 'Dell PowerEdge Rack Server', 'Office Workstations (5 units)', 'ERP Software License'],
  equipment_capex: ['UPS & Backup Power Generator', 'Office Conference Audio/Visual Rig', 'HVAC Air Conditioning Unit'],
  corporate_nps: ['NPS Employer Contribution (10% Basic)', 'Executive Pension Restructuring'],
  employee_cost: ['Senior React/Node Developer Retainer', 'Full-stack Engineer Onboarding', 'Quarterly Milestone Incentive'],
  rent_utilities: ['Commercial Office Lease', 'High-Speed Dedicated Fiber Internet', 'Electricity & Facility Maintenance'],
};

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  loggedExpenses,
  setLoggedExpenses,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [category, setCategory] = useState<QuickExpenseCategory>('operating_expense');
  const [amount, setAmount] = useState<number>(100000);
  const [description, setDescription] = useState<string>('AWS Cloud Infrastructure');
  const [vendorName, setVendorName] = useState<string>('Amazon Web Services India');
  const [capexTiming, setCapexTiming] = useState<'before_oct_3' | 'after_oct_3'>('before_oct_3');
  const [whollyBusiness, setWhollyBusiness] = useState<boolean>(true);
  const [bankChannel, setBankChannel] = useState<boolean>(true);
  const [hasGstInvoice, setHasGstInvoice] = useState<boolean>(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentExpenseInput: QuickExpenseInput = {
    category,
    amount,
    description,
    vendorName,
    capexTiming,
    isWhollyBusinessPurpose: whollyBusiness,
    hasValidGstInvoice: hasGstInvoice,
  };

  const taxImpact = calculateExpenseTaxImpact(profile, currentExpenseInput);

  const handleApplyPresetAmount = (preset: number) => {
    setAmount(preset);
  };

  const handleSelectCategory = (catId: QuickExpenseCategory) => {
    setCategory(catId);
    const suggestions = SUGGESTED_DESCRIPTIONS[catId] || [];
    if (suggestions.length > 0) {
      setDescription(suggestions[0]);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newExpense: LoggedExpense = {
      ...currentExpenseInput,
      id: `exp_${Date.now()}`,
      timestamp: Date.now(),
      immediateDeduction: taxImpact.immediateDeduction,
      taxSaved: taxImpact.taxSaved,
      netCashCost: taxImpact.netCashCost,
    };

    // Update profile
    const updatedProfile = applyExpenseToProfile(profile, newExpense);
    onProfileUpdated(updatedProfile);

    // Save to session history
    setLoggedExpenses(prev => [newExpense, ...prev]);

    setSuccessToast(
      `Successfully logged ${formatINR(amount)} under ${category.replace('_', ' ')}! Saved approx ${formatINR(taxImpact.taxSaved)} in taxes.`
    );

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleRemoveLoggedExpense = (expenseId: string) => {
    const expenseToRemove = loggedExpenses.find(e => e.id === expenseId);
    if (!expenseToRemove) return;

    // Rollback profile numbers by deducting the amount
    const rolledBackProfile: BusinessProfile = { ...profile };
    const amt = expenseToRemove.amount;

    if (expenseToRemove.category === 'operating_expense') {
      rolledBackProfile.operatingExpenses = Math.max(0, (rolledBackProfile.operatingExpenses || 0) - amt);
    } else if (expenseToRemove.category === 'computers_capex') {
      rolledBackProfile.capitalExpenditureComputers = Math.max(0, (rolledBackProfile.capitalExpenditureComputers || 0) - amt);
    } else if (expenseToRemove.category === 'equipment_capex') {
      rolledBackProfile.capitalExpenditureEquipment = Math.max(0, (rolledBackProfile.capitalExpenditureEquipment || 0) - amt);
    } else if (expenseToRemove.category === 'employee_cost' || expenseToRemove.category === 'corporate_nps') {
      rolledBackProfile.employeeCosts = Math.max(0, (rolledBackProfile.employeeCosts || 0) - amt);
    } else if (expenseToRemove.category === 'rent_utilities') {
      rolledBackProfile.rentAndUtilities = Math.max(0, (rolledBackProfile.rentAndUtilities || 0) - amt);
    }

    onProfileUpdated(rolledBackProfile);
    setLoggedExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const totalSessionSavings = loggedExpenses.reduce((acc, curr) => acc + curr.taxSaved, 0);
  const totalSessionExpenses = loggedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-expense-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="quick-expense-title" className="text-lg font-bold tracking-tight text-white">
                  Quick Expense & Deduction Logger
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Instant P&L Impact
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Log business expenditures or tech capex to claim statutory deductions and reduce tax.
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

        {/* Tab Toggle: Logger vs Session History */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('log')}
            className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'log'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Expense</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Session Logs ({loggedExpenses.length})</span>
            {loggedExpenses.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                {formatINR(totalSessionSavings)} saved
              </span>
            )}
          </button>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="font-bold underline text-emerald-700 hover:text-emerald-900 ml-2"
            >
              View in History
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'log' ? (
            <form onSubmit={handleSubmitExpense} className="space-y-5">
              
              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Expenditure Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.id;
                    const IconComponent = cat.icon;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
                            {cat.section}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{cat.rateLabel}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Input & Preset Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="expense-amount-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Expense Amount (INR)
                  </label>
                  <span className="text-xs text-slate-500">
                    Entered: <strong className="text-slate-900">{formatINR(amount)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="100000"
                    required
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500 mr-1">Quick chips:</span>
                  {PRESET_AMOUNTS.map(preset => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => handleApplyPresetAmount(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        amount === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expense-description-input" className="text-xs font-bold text-slate-700 block mb-1">
                    Purpose / Item Description
                  </label>
                  <input
                    id="expense-description-input"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. AWS Cloud Hosting, Laptops"
                    required
                  />
                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(SUGGESTED_DESCRIPTIONS[category] || []).slice(0, 2).map(sug => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => setDescription(sug)}
                        className="text-[10px] text-slate-500 hover:text-emerald-700 hover:underline"
                      >
                        • {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="expense-vendor-input" className="text-xs font-bold text-slate-700 block mb-1">
                    Vendor / Counterparty
                  </label>
                  <input
                    id="expense-vendor-input"
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Amazon Web Services, Dell India"
                  />
                </div>
              </div>

              {/* Capex Timing Selection (Only for Capex categories) */}
              {(category === 'computers_capex' || category === 'equipment_capex') && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2">
                  <span className="font-bold text-blue-900 block">
                    Put-to-Use Date & Half-Year Rule (Section 32 Proviso)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCapexTiming('before_oct_3')}
                      className={`p-2 rounded-lg border text-left transition ${
                        capexTiming === 'before_oct_3'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100/50'
                      }`}
                    >
                      <div className="text-xs">Put to use before Oct 3</div>
                      <div className="text-[10px] opacity-90">100% full-year rate (40% depr)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapexTiming('after_oct_3')}
                      className={`p-2 rounded-lg border text-left transition ${
                        capexTiming === 'after_oct_3'
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100/50'
                      }`}
                    >
                      <div className="text-xs">Put to use after Oct 3</div>
                      <div className="text-[10px] opacity-90">50% half-year rate (20% depr)</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Statutory Compliance Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whollyBusiness}
                    onChange={(e) => setWhollyBusiness(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Incurred wholly and exclusively for business purposes (Section 37(1) test)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bankChannel}
                    onChange={(e) => setBankChannel(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Paid through digital/banking channel (complies with Section 40A(3) ₹10,000 cash cap)</span>
                </label>
              </div>

              {/* Real-Time Tax Saving Card */}
              <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Live Tax Deduction & Cash Impact
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {taxImpact.statutorySection}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Gross Outflow</span>
                    <strong className="text-sm text-slate-900">{formatINR(amount)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Current FY Deduction</span>
                    <strong className="text-sm text-slate-900">{formatINR(taxImpact.immediateDeduction)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300">
                    <span className="text-[10px] text-emerald-800 font-semibold block">Est. Tax Saved</span>
                    <strong className="text-sm text-emerald-700">{formatINR(taxImpact.taxSaved)}</strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Net Real Cost</span>
                    <strong className="text-sm text-slate-900">{formatINR(taxImpact.netCashCost)}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {taxImpact.explanation} Because your marginal business tax rate is approx{' '}
                  <strong className="text-slate-900">{((taxImpact.taxSaved / (taxImpact.immediateDeduction || 1)) * 100).toFixed(1)}%</strong>,
                  every ₹1 Lakh in deduction reduces your income tax bill by approx{' '}
                  <strong className="text-emerald-700">{formatINR(Math.round(100000 * (taxImpact.taxSaved / (taxImpact.immediateDeduction || 1))))}</strong>.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Expense & Update P&L</span>
                </button>
              </div>

            </form>
          ) : (
            /* Session Logs History Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Expenses Logged This Session</h3>
                  <p className="text-xs text-slate-500">
                    Track the deductions applied to your active profile with option to undo.
                  </p>
                </div>
                {loggedExpenses.length > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total Tax Saved</span>
                    <strong className="text-sm text-emerald-700 font-extrabold">{formatINR(totalSessionSavings)}</strong>
                  </div>
                )}
              </div>

              {loggedExpenses.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No expenses logged yet this session.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Use the "Record New Expense" tab to quickly log items and claim deductions.</p>
                  <button
                    onClick={() => setActiveTab('log')}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                  >
                    Log First Expense
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {loggedExpenses.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{item.description}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Amount: <strong className="text-slate-800">{formatINR(item.amount)}</strong> • Immediate Deduction: {formatINR(item.immediateDeduction)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-700 font-bold block">Tax Saved</span>
                          <strong className="text-xs text-emerald-700">{formatINR(item.taxSaved)}</strong>
                        </div>
                        <button
                          onClick={() => handleRemoveLoggedExpense(item.id)}
                          title="Undo / Remove expense from P&L"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
