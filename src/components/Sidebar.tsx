import React from 'react';
import {
  LayoutDashboard,
  PiggyBank,
  Calculator,
  Building2,
  BookOpen,
  GitCompare,
  SlidersHorizontal,
  Calendar,
  FileText,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { formatCompactINR, formatINR } from '../utils/formatters.ts';

export type ActiveTab =
  | 'dashboard'
  | 'planner'
  | 'calculator'
  | 'profile'
  | 'explorer'
  | 'compare'
  | 'simulator'
  | 'calendar'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  baselineTax: number;
  optimizedTax: number;
  totalTaxSaved: number;
  activeStrategiesCount: number;
  onOpenAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  baselineTax,
  optimizedTax,
  totalTaxSaved,
  activeStrategiesCount,
  onOpenAssistant,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Tax Saving Planner', icon: PiggyBank, badge: activeStrategiesCount > 0 ? `${activeStrategiesCount} active` : undefined },
    { id: 'calculator', label: 'Tax Calculator', icon: Calculator },
    { id: 'profile', label: 'Business Profile & Setup', icon: Building2 },
    { id: 'explorer', label: 'Deduction Explorer', icon: BookOpen },
    { id: 'compare', label: 'Entity & Strategy Matrix', icon: GitCompare },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'calendar', label: 'Tax Calendar & Deadlines', icon: Calendar },
    { id: 'reports', label: 'Reports & Exports', icon: FileText },
    { id: 'settings', label: 'Settings & Verified Law', icon: ShieldCheck },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 bottom-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-[calc(100vh-4rem)] overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          
          {/* Main Navigation */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Financial Suite
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition ${
                          isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Tax Reduction Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                Tax Liability
              </span>
              <span className="text-emerald-400 font-bold">
                {totalTaxSaved > 0 ? `-${formatCompactINR(totalTaxSaved)}` : 'Baseline'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Before Planning:</span>
                <span className="text-slate-200 font-medium">{formatINR(baselineTax)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With Strategies:</span>
                <span className="text-emerald-400 font-semibold">{formatINR(optimizedTax)}</span>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('planner')}
              className="w-full text-center py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition"
            >
              Optimize More Strategies &rarr;
            </button>
          </div>

        </div>

        {/* AI Assistant Banner at Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onOpenAssistant}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-800/70 hover:from-slate-800 hover:to-slate-700 border border-slate-700 text-left transition group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  AI Tax Assistant
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ask questions grounded in your financial data.
            </p>
          </button>
        </div>
      </aside>
    </>
  );
};
