/**
 * TaxWise AI - Intelligent Business Tax Saving & Financial Planner
 * Complete Indian Business Tax Planning & Optimization Application
 */

import React, { useState } from 'react';
import type { BusinessProfile } from './taxEngine/types.ts';
import { SCENARIO_1_2_CRORE } from './taxEngine/scenarios.ts';
import { calculateBusinessTax } from './taxEngine/calculator.ts';
import { generateTaxStrategies, optimizeTaxStrategies } from './taxEngine/strategies.ts';

import { Navbar } from './components/Navbar.tsx';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PlannerView } from './components/PlannerView.tsx';
import { CalculatorView } from './components/CalculatorView.tsx';
import { OnboardingWizard } from './components/OnboardingWizard.tsx';
import { DeductionExplorerView } from './components/DeductionExplorerView.tsx';
import { StrategyComparisonView } from './components/StrategyComparisonView.tsx';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView.tsx';
import { TaxCalendarView } from './components/TaxCalendarView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { SettingsAndSourcesView } from './components/SettingsAndSourcesView.tsx';
import { AIAssistantDrawer } from './components/AIAssistantDrawer.tsx';

export default function App() {
  // Preload the official Phase 9 ₹1.2 Crore Demonstration Scenario
  const [profile, setProfile] = useState<BusinessProfile>(SCENARIO_1_2_CRORE);
  
  // Preload 3 high-yield legitimate strategies
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<string[]>([
    'strat_nps_80ccd2',
    'strat_capex_computers',
    'strat_expense_capture',
  ]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenAssistant = (prompt?: string) => {
    if (prompt) {
      setAssistantInitialPrompt(prompt);
    }
    setAssistantOpen(true);
  };

  // Compute live calculations
  const calculation = calculateBusinessTax(profile);
  const allStrategies = generateTaxStrategies(profile);
  const optimization = optimizeTaxStrategies(profile, selectedStrategyIds);

  const handleToggleStrategy = (id: string) => {
    setSelectedStrategyIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectMultipleStrategies = (ids: string[]) => {
    setSelectedStrategyIds(ids);
  };

  const handleClearStrategies = () => {
    setSelectedStrategyIds([]);
  };

  const handleResetToDemo = () => {
    setProfile(SCENARIO_1_2_CRORE);
    setSelectedStrategyIds([
      'strat_nps_80ccd2',
      'strat_capex_computers',
      'strat_expense_capture',
    ]);
  };

  const handleSelectPreset = (newProfile: BusinessProfile) => {
    setProfile(newProfile);
    // Auto-select eligible strategies for the new profile
    const newStrategies = generateTaxStrategies(newProfile);
    const eligibleIds = newStrategies.filter(s => s.eligible && s.riskLevel === 'low').map(s => s.id);
    setSelectedStrategyIds(eligibleIds);
  };

  const handleSelectEntityAndRegime = (entityType: any, regime: any) => {
    setProfile(prev => ({
      ...prev,
      entityType,
      taxRegime: regime,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <Navbar
        currentProfile={profile}
        onSelectPreset={handleSelectPreset}
        onResetToDemo={handleResetToDemo}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenWizard={() => setWizardOpen(true)}
        baselineTax={calculation.totalTaxLiability}
        totalSavings={optimization.totalTaxSaved}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Layout: Sidebar + Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          baselineTax={calculation.totalTaxLiability}
          optimizedTax={optimization.optimizedTax}
          totalTaxSaved={optimization.totalTaxSaved}
          activeStrategiesCount={selectedStrategyIds.length}
          onOpenAssistant={() => setAssistantOpen(true)}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-5xl">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              calculation={calculation}
              allStrategies={allStrategies}
              selectedStrategyIds={selectedStrategyIds}
              onToggleStrategy={handleToggleStrategy}
              onNavigateTab={setActiveTab}
              onOpenAssistant={handleOpenAssistant}
              onOpenWizard={() => setWizardOpen(true)}
              onUpdateProfile={(newProfile) => setProfile(newProfile)}
            />
          )}

          {activeTab === 'planner' && (
            <PlannerView
              profile={profile}
              allStrategies={allStrategies}
              selectedStrategyIds={selectedStrategyIds}
              onToggleStrategy={handleToggleStrategy}
              onSelectMultiple={handleSelectMultipleStrategies}
              onClearStrategies={handleClearStrategies}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
          )}

          {activeTab === 'calculator' && (
            <CalculatorView
              profile={profile}
              calculation={calculation}
              onOpenWizard={() => setWizardOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Business Profile & Financial Setup
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage your business structure, statutory parameters, and financial baseline numbers.
                  </p>
                </div>
                <button
                  onClick={() => setWizardOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Launch Step-by-Step Wizard
                </button>
              </div>

              {/* Readonly Overview Card with Quick Edit */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  Current Business Profile Parameters
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Entity Name</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">{profile.name}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Legal Structure</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block capitalize">{profile.entityType.replace('_', ' ')}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Financial Year</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">{profile.financialYear}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Gross Annual Revenue</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">₹{profile.grossRevenue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Operating Costs</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">₹{profile.operatingExpenses.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Payroll & Wages</span>
                    <strong className="text-slate-900 text-sm mt-0.5 block">₹{profile.employeeCosts.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'explorer' && (
            <DeductionExplorerView />
          )}

          {activeTab === 'compare' && (
            <StrategyComparisonView
              profile={profile}
              onSelectEntityAndRegime={handleSelectEntityAndRegime}
            />
          )}

          {activeTab === 'simulator' && (
            <WhatIfSimulatorView
              baseProfile={profile}
              baseCalculation={calculation}
              onApplySimulatedToProfile={(sim) => {
                setProfile(sim);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <TaxCalendarView
              profile={profile}
              calculation={calculation}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              profile={profile}
              calculation={calculation}
              selectedStrategyIds={selectedStrategyIds}
              allStrategies={allStrategies}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAndSourcesView />
          )}

        </main>
      </div>

      {/* Onboarding / Setup Modal Wizard */}
      {wizardOpen && (
        <OnboardingWizard
          initialProfile={profile}
          onSaveProfile={(newProf) => {
            setProfile(newProf);
          }}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={assistantOpen}
        onClose={() => {
          setAssistantOpen(false);
          setAssistantInitialPrompt('');
        }}
        profile={profile}
        calculation={calculation}
        strategies={allStrategies}
        initialPrompt={assistantInitialPrompt}
      />

    </div>
  );
}
