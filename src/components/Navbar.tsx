import React from 'react';
import { 
  Building2, 
  Sparkles, 
  RotateCcw, 
  ChevronDown, 
  Menu, 
  X,
  FileCheck2,
  TrendingDown
} from 'lucide-react';
import type { BusinessProfile } from '../taxEngine/types.ts';
import { PRESET_SCENARIOS } from '../taxEngine/scenarios.ts';
import { formatCompactINR } from '../utils/formatters.ts';

interface NavbarProps {
  currentProfile: BusinessProfile;
  onSelectPreset: (profile: BusinessProfile) => void;
  onResetToDemo: () => void;
  onOpenAssistant: () => void;
  onOpenWizard: () => void;
  baselineTax: number;
  totalSavings: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  onSelectPreset,
  onResetToDemo,
  onOpenAssistant,
  onOpenWizard,
  baselineTax,
  totalSavings,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [presetDropdownOpen, setPresetDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
                <FileCheck2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                    TaxWise AI
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    India
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Intelligent Business Tax Saving & Financial Planner
                </p>
              </div>
            </div>
          </div>

          {/* Quick Scenario Preset Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[170px] truncate">{currentProfile.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {presetDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Business Scenario
                  </div>
                  {PRESET_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        onSelectPreset(scenario.profile);
                        setPresetDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/90 flex flex-col transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 group-hover:text-emerald-400">
                          {scenario.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {scenario.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {scenario.profile.industry} • Rev {formatCompactINR(scenario.profile.grossRevenue)}
                      </span>
                    </button>
                  ))}
                  <div className="pt-1.5 border-t border-slate-800 px-2">
                    <button
                      onClick={() => {
                        onOpenWizard();
                        setPresetDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:bg-emerald-500/10 rounded-lg transition"
                    >
                      + Create Custom Business Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
              {currentProfile.financialYear}
            </div>
          </div>

          {/* Right Action Controls: AI Assistant & Quick Stats */}
          <div className="flex items-center gap-2.5">
            {totalSavings > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Saved: <strong>{formatCompactINR(totalSavings)}</strong></span>
              </div>
            )}

            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
              <span>Ask Tax AI</span>
            </button>

            <button
              onClick={onResetToDemo}
              title="Reset to ₹1.2 Cr Official Demo Scenario"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
              aria-label="Reset to 1.2 Crore Scenario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
