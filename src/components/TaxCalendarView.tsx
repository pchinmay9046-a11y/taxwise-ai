import React from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
  Info
} from 'lucide-react';
import type { BusinessProfile, TaxCalculationResult } from '../taxEngine/types.ts';
import { STATUTORY_TAX_CALENDAR } from '../taxEngine/taxCalendar.ts';
import { formatINR } from '../utils/formatters.ts';

interface TaxCalendarViewProps {
  profile: BusinessProfile;
  calculation: TaxCalculationResult;
}

export const TaxCalendarView: React.FC<TaxCalendarViewProps> = ({
  profile,
  calculation,
}) => {
  const estimatedAnnualTax = calculation.totalTaxLiability;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Statutory Compliance Roadmap
          </span>
          <span className="text-xs text-slate-500">• Advance Tax, Audit & ITR Deadlines</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Indian Business Tax Calendar & Advance Tax Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Based on your estimated tax liability of <strong>{formatINR(estimatedAnnualTax)}</strong>, ensure quarterly advance tax installments are deposited on time to avoid Section 234B and 234C interest penalties.
        </p>
      </div>

      {/* Advance Tax Installment Breakdown Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Statutory Advance Tax Payment Schedule ({profile.financialYear})
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            Taxes Deposited to Date: {formatINR(calculation.taxesAlreadyPaid)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            {
              quarter: 'Q1 (June 15)',
              pct: 15,
              dueAmount: Math.round(estimatedAnnualTax * 0.15),
              status: 'Completed',
              desc: 'At least 15% of annual estimated tax'
            },
            {
              quarter: 'Q2 (Sept 15)',
              pct: 45,
              dueAmount: Math.round(estimatedAnnualTax * 0.45),
              status: 'Completed',
              desc: 'Cumulative 45% of annual tax'
            },
            {
              quarter: 'Q3 (Dec 15)',
              pct: 75,
              dueAmount: Math.round(estimatedAnnualTax * 0.75),
              status: 'Upcoming',
              desc: 'Cumulative 75% of annual tax'
            },
            {
              quarter: 'Q4 (March 15)',
              pct: 100,
              dueAmount: estimatedAnnualTax,
              status: 'Pending',
              desc: '100% of full-year tax liability'
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{item.quarter}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {item.pct}%
                  </span>
                </div>
                <span className="text-slate-400 text-[11px] mt-1 block">{item.desc}</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cumulative Target</span>
                <span className="text-base font-extrabold text-emerald-300 block">{formatINR(item.dueAmount)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Section 234C Interest Warning</strong>: If the advance tax paid by the 15th of June or September is less than 12% or 36% of the returned tax, simple interest @ 1% per month is charged on the deficit amount.
          </span>
        </div>
      </div>

      {/* Statutory Deadlines List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          All Statutory Tax Deadlines for {profile.entityType.toUpperCase().replace('_', ' ')}
        </h2>

        <div className="space-y-3">
          {STATUTORY_TAX_CALENDAR.filter(e => e.applicableEntities.includes(profile.entityType)).map((ev) => (
            <div
              key={ev.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{ev.dueDate}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ev.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800">{ev.title}</h3>
                <p className="text-slate-600">{ev.description}</p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Action:</strong> {ev.actionRequired}
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 block">
                  {ev.penaltyClause}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
