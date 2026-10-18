import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  X,
  Receipt,
  SlidersHorizontal,
  Bot,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Command,
  CornerDownLeft
} from 'lucide-react';
import type { BusinessProfile } from '../taxEngine/types.ts';
import { QuickExpenseModal } from './QuickExpenseModal.tsx';
import { QuickScenarioModal } from './QuickScenarioModal.tsx';
import type { LoggedExpense } from '../taxEngine/quickActionsEngine.ts';
import { formatINR } from '../utils/formatters.ts';

interface QuickActionsFloatingMenuProps {
  profile: BusinessProfile;
  onUpdateProfile: (updatedProfile: BusinessProfile) => void;
  onOpenAssistant: (initialPrompt?: string) => void;
  onNavigateTab: (tab: any) => void;
  baselineTax: number;
  totalTaxSaved: number;
}

export const QuickActionsFloatingMenu: React.FC<QuickActionsFloatingMenuProps> = ({
  profile,
  onUpdateProfile,
  onOpenAssistant,
  onNavigateTab,
  baselineTax,
  totalTaxSaved,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [loggedExpenses, setLoggedExpenses] = useState<LoggedExpense[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K toggles the quick action menu
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape closes the menu
      if (e.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOpenExpenseLogger = () => {
    setIsOpen(false);
    setExpenseModalOpen(true);
  };

  const handleOpenScenarioRunner = () => {
    setIsOpen(false);
    setScenarioModalOpen(true);
  };

  const handleOpenAIWithPrompt = (prompt?: string) => {
    setIsOpen(false);
    onOpenAssistant(prompt);
  };

  const handleOpenCalendar = () => {
    setIsOpen(false);
    onNavigateTab('calendar');
  };

  const handleOpenReports = () => {
    setIsOpen(false);
    onNavigateTab('reports');
  };

  const aiPrompts = [
    'How can I legally reduce my business tax?',
    'Explain the 45-day MSME rule u/s 43B(h)',
    'Is Section 80CCD(2) Corporate NPS eligible under my regime?',
    'Should I purchase tech hardware before or after Oct 3?',
  ];

  return (
    <>
      {/* Floating Speed Dial Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        
        {/* Floating Menu Popover */}
        {isOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Quick Actions Menu"
            className="mb-3 w-[calc(100vw-3rem)] sm:w-96 max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-tight text-white">Quick Actions</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Instant Tasks
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 block">
                    Grounded in {profile.name} ({formatINR(profile.grossRevenue)})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Quick Actions menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1.5 max-h-[75vh] overflow-y-auto">
              
              {/* Task 1: Log Business Expense */}
              <button
                onClick={handleOpenExpenseLogger}
                className="w-full p-3 rounded-2xl text-left transition hover:bg-emerald-50/80 group border border-transparent hover:border-emerald-200 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                      Log Business Expense
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      Sec 37 / 32
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Record operational expense or IT capex to claim instant deduction
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>

              {/* Task 2: Run Scenario */}
              <button
                onClick={handleOpenScenarioRunner}
                className="w-full p-3 rounded-2xl text-left transition hover:bg-indigo-50/80 group border border-transparent hover:border-indigo-200 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                      Run What-If Scenario
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                      5 Presets
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    Simulate +25% revenue surge, ₹5L tech capex, or regime arbitrage
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>

              {/* Task 3: Chat with AI */}
              <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-purple-950">Chat with Tax AI</span>
                  </div>
                  <button
                    onClick={() => handleOpenAIWithPrompt()}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <span>Open Drawer</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {aiPrompts.slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenAIWithPrompt(prompt)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-purple-100/70 text-[11px] text-slate-700 hover:text-purple-950 transition border border-purple-100 flex items-center justify-between group"
                    >
                      <span className="truncate pr-1">"{prompt}"</span>
                      <CornerDownLeft className="w-3 h-3 text-purple-400 group-hover:text-purple-700 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Utility Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleOpenCalendar}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition flex items-center gap-2 group"
                >
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">Tax Deadlines</div>
                    <div className="text-[10px] text-slate-500 truncate">Advance Tax & TDS</div>
                  </div>
                </button>

                <button
                  onClick={handleOpenReports}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition flex items-center gap-2 group"
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">Export Report</div>
                    <div className="text-[10px] text-slate-500 truncate">CA Summary PDF</div>
                  </div>
                </button>
              </div>

            </div>

            {/* Footer with keyboard hint */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3 text-slate-400" />
                <span>Press <strong>⌘K</strong> or <strong>Ctrl+K</strong> to toggle</span>
              </span>
              <span><strong>Esc</strong> to close</span>
            </div>
          </div>
        )}

        {/* Floating Action Trigger Button (FAB) */}
        <button
          ref={triggerButtonRef}
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={isOpen ? "Close Quick Actions Menu" : "Open Quick Actions Floating Menu (Log Expense, Run Scenario, Chat with AI)"}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 group ${
            isOpen
              ? 'bg-slate-900 text-white ring-4 ring-slate-800/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95'
          }`}
        >
          <div className="relative">
            {isOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
            ) : (
              <Zap className="w-5 h-5 fill-current transition-transform duration-200 group-hover:rotate-12" />
            )}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            )}
          </div>
          
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Close' : 'Quick Actions'}
          </span>

          {!isOpen && (
            <span className="text-[10px] font-semibold bg-emerald-700/80 px-1.5 py-0.5 rounded-md text-emerald-100 hidden sm:inline-block border border-emerald-500/40">
              ⌘K
            </span>
          )}
        </button>

      </div>

      {/* Log Expense Modal Dialog */}
      <QuickExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        profile={profile}
        onProfileUpdated={onUpdateProfile}
        loggedExpenses={loggedExpenses}
        setLoggedExpenses={setLoggedExpenses}
      />

      {/* Run Scenario Modal Dialog */}
      <QuickScenarioModal
        isOpen={scenarioModalOpen}
        onClose={() => setScenarioModalOpen(false)}
        profile={profile}
        onApplyScenario={onUpdateProfile}
        onNavigateToSimulator={() => onNavigateTab('simulator')}
      />
    </>
  );
};
