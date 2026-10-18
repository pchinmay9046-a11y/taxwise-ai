import React from 'react';
import {
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Info,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';
import { VERIFIED_TAX_RULES } from '../taxEngine/taxLawDatabase.ts';

export const SettingsAndSourcesView: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Phase 12 Statutory Grounding
          </span>
          <span className="text-xs text-slate-500">• Versioned Tax Law Registry</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Statutory Sources & Verified Tax Law Database
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          TaxWise AI calculations are strictly derived from the Income-tax Act, 1961, Finance Acts, and CBDT notifications. No synthetic or unauthorized provisions are used.
        </p>
      </div>

      {/* Official Government Portals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            name: 'Income Tax Department (CBDT)',
            url: 'https://www.incometax.gov.in/',
            desc: 'Official e-Filing portal, tax slab circulars, and return filing rules.',
          },
          {
            name: 'Ministry of MSME (Udyam)',
            url: 'https://msme.gov.in/',
            desc: 'Section 43B(h) supplier verification and MSME payment guidelines.',
          },
          {
            name: 'Startup India (DPIIT)',
            url: 'https://www.startupindia.gov.in/',
            desc: 'Section 80-IAC 100% tax holiday eligibility and certification.',
          },
        ].map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                  {source.name}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {source.desc}
              </p>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-4 block">
              Official Portal &rarr;
            </span>
          </a>
        ))}
      </div>

      {/* Verified Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Statutory Provisions & Verification Log
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Total {VERIFIED_TAX_RULES.length} Verified Rules
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {VERIFIED_TAX_RULES.map((rule) => (
            <div key={rule.id} className="p-5 hover:bg-slate-50/60 transition space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {rule.section}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {rule.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    VERIFIED ({rule.lastVerifiedDate})
                  </span>
                  <a
                    href={rule.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-700"
                    title="View official government source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                {rule.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span><strong>Applicable Law:</strong> {rule.applicableLaw}</span>
                <span><strong>Applies to:</strong> {rule.applicableEntities.join(', ')}</span>
                <span><strong>Effective FY:</strong> {rule.effectiveFinancialYear}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
