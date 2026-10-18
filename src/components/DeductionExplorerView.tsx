import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Tag,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { VERIFIED_TAX_RULES } from '../taxEngine/taxLawDatabase.ts';

export const DeductionExplorerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(VERIFIED_TAX_RULES.map(r => r.category)))];

  const filteredRules = VERIFIED_TAX_RULES.filter(rule => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Official Statutory Encyclopedia
          </span>
          <span className="text-xs text-slate-500">• CBDT & Finance Acts Grounded</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Indian Business Deduction Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Search and verify statutory allowances, expense deductions, accelerated depreciation, and tax holiday provisions under the Income-tax Act, 1961.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by section, keyword (e.g. 43B(h), 80JJAA, depreciation, 115BAA)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-900 text-white">
                  {rule.section}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  VERIFIED LAW
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {rule.title}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                Category: {rule.category}
              </p>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {rule.summary}
              </p>

              {rule.statutoryLimit && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900">Statutory Limits & Ceilings:</strong> {rule.statutoryLimit}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Effective: {rule.effectiveFinancialYear}
              </span>
              <a
                href={rule.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px]"
              >
                <span>incometax.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
