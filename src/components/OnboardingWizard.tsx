import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Coins,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  X,
  FileCheck
} from 'lucide-react';
import type { BusinessProfile, EntityType, TaxRegime, FinancialYear, RevenueInputType } from '../taxEngine/types.ts';
import { PRESET_SCENARIOS, SCENARIO_1_2_CRORE } from '../taxEngine/scenarios.ts';
import { formatINR } from '../utils/formatters.ts';

interface OnboardingWizardProps {
  initialProfile: BusinessProfile;
  onSaveProfile: (profile: BusinessProfile) => void;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onSaveProfile,
  onClose,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<BusinessProfile>({ ...initialProfile });

  const updateField = (field: keyof BusinessProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (preset: BusinessProfile) => {
    setFormData({ ...preset });
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Wizard Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Step {step} of 4
              </span>
              <span className="text-xs text-slate-400">• Indian Business Tax Profile</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Smart Business Tax Setup Wizard
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-100/80 px-6 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="font-bold text-slate-500 shrink-0">Presets:</span>
          {PRESET_SCENARIOS.map(preset => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset.profile)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-medium shrink-0 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Step Progress Indicator */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className={step >= 1 ? 'text-emerald-600 font-bold' : ''}>1. Jurisdiction</span>
            <span className={step >= 2 ? 'text-emerald-600 font-bold' : ''}>2. Entity & Regime</span>
            <span className={step >= 3 ? 'text-emerald-600 font-bold' : ''}>3. Financials</span>
            <span className={step >= 4 ? 'text-emerald-600 font-bold' : ''}>4. Operations</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* STEP 1: Jurisdiction & Tax Year */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Business Location & Tax Jurisdiction</h3>
                <p className="text-slate-500 mt-0.5">Configure your legal tax jurisdiction and financial assessment year.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Acme Tech Solutions"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Financial Year (FY / AY)</label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) => updateField('financialYear', e.target.value as FinancialYear)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="FY 2025-26 (AY 2026-27)">FY 2025-26 (AY 2026-27) — Current</option>
                    <option value="FY 2024-25 (AY 2025-26)">FY 2024-25 (AY 2025-26)</option>
                    <option value="FY 2026-27 (AY 2027-28)">FY 2026-27 (AY 2027-28) — Planning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Union Territory</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. Karnataka, Maharashtra, Delhi"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency & Jurisdiction</label>
                  <input
                    type="text"
                    disabled
                    value="Indian Rupee (INR ₹) • Central Board of Direct Taxes (CBDT)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Legal Entity & Tax Regime */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Legal Business Structure & Tax Regime</h3>
                <p className="text-slate-500 mt-0.5">Select the statutory entity form under Indian law.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'proprietorship',
                    title: 'Sole Proprietorship',
                    desc: 'Individual business. Taxed at individual slabs under Section 115BAC or Old Regime.',
                  },
                  {
                    id: 'llp',
                    title: 'Limited Liability Partnership (LLP)',
                    desc: 'Flat 30% firm tax + partner remuneration u/s 40(b). Limited liability shield.',
                  },
                  {
                    id: 'partnership',
                    title: 'Partnership Firm',
                    desc: 'Traditional registered partnership. Flat 30% tax + Section 40(b) partner limits.',
                  },
                  {
                    id: 'pvt_ltd',
                    title: 'Domestic Private Limited Company',
                    desc: 'Corporate entity. Concessional 25.17% flat rate under Section 115BAA with zero MAT.',
                  },
                ].map((ent) => (
                  <button
                    key={ent.id}
                    type="button"
                    onClick={() => {
                      updateField('entityType', ent.id);
                      if (ent.id === 'pvt_ltd') updateField('taxRegime', '115BAA');
                      else if (ent.id === 'proprietorship') updateField('taxRegime', 'new');
                      else updateField('taxRegime', 'firm_standard');
                    }}
                    className={`text-left p-3.5 rounded-xl border transition ${
                      formData.entityType === ent.id
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ent.title}</span>
                      {formData.entityType === ent.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{ent.desc}</p>
                  </button>
                ))}
              </div>

              {/* Regime Selector for selected entity */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Applicable Tax Regime</span>
                {formData.entityType === 'proprietorship' ? (
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regime"
                        checked={formData.taxRegime === 'new'}
                        onChange={() => updateField('taxRegime', 'new')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">New Tax Regime u/s 115BAC (Default, lower slabs, 87A rebate)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regime"
                        checked={formData.taxRegime === 'old'}
                        onChange={() => updateField('taxRegime', 'old')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">Old Tax Regime (Allows 80C/80D/80G deductions)</span>
                    </label>
                  </div>
                ) : formData.entityType === 'pvt_ltd' ? (
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regime"
                        checked={formData.taxRegime === '115BAA'}
                        onChange={() => updateField('taxRegime', '115BAA')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">Section 115BAA (25.17% flat rate, zero MAT)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="regime"
                        checked={formData.taxRegime === 'normal_company'}
                        onChange={() => updateField('taxRegime', 'normal_company')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">Normal Corporate Tax (25% + MAT u/s 115JB)</span>
                    </label>
                  </div>
                ) : (
                  <span className="text-slate-600">Standard Firm / LLP tax rate (30% + 12% surcharge if &gt; ₹1 Cr + 4% cess).</span>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Financial Information */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Financial Numbers & Statutory Accounting</h3>
                <p className="text-slate-500 mt-0.5">Never confuse revenue with profit. Enter figures in Indian Rupees (INR).</p>
              </div>

              {/* Phase 9 Revenue vs Profit input mode toggle */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="font-bold text-emerald-950 block mb-1">Turnover Input Interpretation (Phase 9)</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'gross_revenue', label: 'Gross Annual Revenue (Turnover)' },
                    { id: 'profit_before_tax', label: 'Profit Before Tax (PBT)' },
                    { id: 'taxable_income', label: 'Pre-computed Taxable Income' },
                  ].map(mode => (
                    <label key={mode.id} className="flex items-center gap-1.5 cursor-pointer text-slate-800">
                      <input
                        type="radio"
                        name="revenueInputType"
                        checked={formData.revenueInputType === mode.id}
                        onChange={() => updateField('revenueInputType', mode.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium">{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gross Annual Revenue (INR ₹)
                  </label>
                  <input
                    type="number"
                    value={formData.grossRevenue || ''}
                    onChange={(e) => updateField('grossRevenue', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="12000000"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{formatINR(formData.grossRevenue)}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operating Expenses (SaaS, Rent, Utilities, Vendors)
                  </label>
                  <input
                    type="number"
                    value={formData.operatingExpenses || ''}
                    onChange={(e) => updateField('operatingExpenses', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{formatINR(formData.operatingExpenses)}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Employee Costs & Wages (Annual Payroll)
                  </label>
                  <input
                    type="number"
                    value={formData.employeeCosts || ''}
                    onChange={(e) => updateField('employeeCosts', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{formatINR(formData.employeeCosts)}</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Section 32 Computer / IT Capex (40% Depr)
                  </label>
                  <input
                    type="number"
                    value={formData.capitalExpenditureComputers || ''}
                    onChange={(e) => updateField('capitalExpenditureComputers', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capital Asset Put to Use Timing
                  </label>
                  <select
                    value={formData.capexTiming}
                    onChange={(e) => updateField('capexTiming', e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="before_oct_3">On or Before Oct 3 (&gt;= 180 Days — Full 100% Rate)</option>
                    <option value="after_oct_3">After Oct 3 (&lt; 180 Days — 50% Rate in Year 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Advance Tax Paid So Far
                  </label>
                  <input
                    type="number"
                    value={formData.advanceTaxPaid || ''}
                    onChange={(e) => updateField('advanceTaxPaid', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    TDS Deducted by Clients (26AS Credit)
                  </label>
                  <input
                    type="number"
                    value={formData.tdsPaid || ''}
                    onChange={(e) => updateField('tdsPaid', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {(formData.entityType === 'partnership' || formData.entityType === 'llp') && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Partner Remuneration Paid (Sec 40(b))
                    </label>
                    <input
                      type="number"
                      value={formData.partnerRemunerationPaid || ''}
                      onChange={(e) => updateField('partnerRemunerationPaid', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Operational Circumstances */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Operational Circumstances & Statutory Eligibility</h3>
                <p className="text-slate-500 mt-0.5">Determine eligibility for Section 80JJAA, Section 44AD/44ADA, and MSME rules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Regular Employees</label>
                  <input
                    type="number"
                    value={formData.employeeCount || ''}
                    onChange={(e) => updateField('employeeCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="e.g. IT Consulting, Manufacturing, E-commerce"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Digital Receipts Percentage (%)</label>
                  <input
                    type="number"
                    max={100}
                    min={0}
                    value={formData.digitalReceiptsPercentage || ''}
                    onChange={(e) => updateField('digitalReceiptsPercentage', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">&gt;= 95% qualifies for ₹10 Cr audit threshold u/s 44AB.</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Working Capital Reserve (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.workingCapitalReserve || ''}
                    onChange={(e) => updateField('workingCapitalReserve', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">DPIIT Recognized Startup (Sec 80-IAC)</span>
                  <span className="text-slate-500 text-[11px]">Enables 100% tax holiday check for eligible innovative ventures.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isDpiitRecognizedStartup}
                  onChange={(e) => updateField('isDpiitRecognizedStartup', e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Recalculate Taxes</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
