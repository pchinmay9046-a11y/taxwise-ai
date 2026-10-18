/**
 * TaxWise AI - Indian Business Tax Calendar & Statutory Compliance Roadmap
 * Tracks Advance Tax installments, ITR deadlines, Tax Audit limits, and TDS filings
 */

import type { TaxCalendarEvent, EntityType } from './types.ts';

export const STATUTORY_TAX_CALENDAR: TaxCalendarEvent[] = [
  {
    id: 'cal_adv_q1',
    title: 'Advance Tax — 1st Installment (15%)',
    dueDate: 'June 15',
    category: 'advance_tax',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Pay at least 15% of the estimated net tax liability for the financial year.',
    penaltyClause: 'Interest @ 1% per month under Section 234C on shortfall below 12% of total tax liability.',
    actionRequired: 'Estimate full-year profits and pay via e-Pay Tax on Income Tax Portal.',
  },
  {
    id: 'cal_adv_q2',
    title: 'Advance Tax — 2nd Installment (45%)',
    dueDate: 'September 15',
    category: 'advance_tax',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Pay cumulative 45% of total estimated annual tax liability.',
    penaltyClause: 'Interest @ 1% per month under Section 234C on shortfall below 36% of total tax.',
    actionRequired: 'Review Q1 actuals, re-forecast annual profit, and deposit tax challan.',
  },
  {
    id: 'cal_adv_q3',
    title: 'Advance Tax — 3rd Installment (75%)',
    dueDate: 'December 15',
    category: 'advance_tax',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Pay cumulative 75% of total estimated annual tax liability.',
    penaltyClause: 'Interest @ 1% per month under Section 234C on shortfall below 75% of total tax.',
    actionRequired: 'Assess festive season / H1 revenues and adjust advance tax payments.',
  },
  {
    id: 'cal_adv_q4',
    title: 'Advance Tax — 4th Installment (100%)',
    dueDate: 'March 15',
    category: 'advance_tax',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Pay 100% of the full-year estimated tax liability before year-end.',
    penaltyClause: 'Interest @ 1% per month under Section 234B (shortfall below 90%) and 234C.',
    actionRequired: 'Final reconciliation of revenue, depreciation, deductions, and TDS credits.',
  },
  {
    id: 'cal_msme_cutoff',
    title: 'Section 43B(h) MSME Dues Settlement Cutoff',
    dueDate: 'March 31',
    category: 'msme_payment',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Clear all pending payments to Micro & Small vendors within 15 days (or 45 days contractual period).',
    penaltyClause: 'Permanent disallowance for the current FY; sum added back to taxable income + 3x RBI bank rate interest.',
    actionRequired: 'Verify supplier Udyam certificates and release vendor payments before banking closes.',
  },
  {
    id: 'cal_itr_nonaudit',
    title: 'ITR Filing Deadline (Non-Audited Businesses)',
    dueDate: 'July 31',
    category: 'itr_filing',
    applicableEntities: ['proprietorship'],
    description: 'Due date for filing Income Tax Return for individuals and businesses not subject to tax audit.',
    penaltyClause: 'Late fee up to ₹5,000 under Section 234F + 1% interest per month under Section 234A.',
    actionRequired: 'File ITR-3 or ITR-4 (Sugam) on incometax.gov.in portal.',
  },
  {
    id: 'cal_tax_audit',
    title: 'Tax Audit Report Submission (Form 3CA/3CB-3CD)',
    dueDate: 'September 30',
    category: 'audit',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'Chartered Accountant must electronically sign and submit Tax Audit Report for entities exceeding statutory turnover thresholds.',
    penaltyClause: 'Penalty under Section 271B: 0.5% of total turnover up to a maximum of ₹1,50,000.',
    actionRequired: 'Provide trial balance, bank books, 43B(h) records, and Form 10DA to statutory auditor.',
  },
  {
    id: 'cal_itr_audit',
    title: 'ITR Filing Deadline (Corporate & Audited Entities)',
    dueDate: 'October 31',
    category: 'itr_filing',
    applicableEntities: ['partnership', 'llp', 'pvt_ltd', 'public_ltd', 'proprietorship'],
    description: 'Due date for filing ITR-5 (LLP/Firm) and ITR-6 (Companies) whose accounts are audited.',
    penaltyClause: 'Late fee under Section 234F + loss of ability to carry forward business losses (Section 80).',
    actionRequired: 'Verify Form 26AS & AIS, approve MCA financial statements, and e-verify ITR with DSC.',
  },
  {
    id: 'cal_tds_q1',
    title: 'Quarterly TDS Return (Q1 - Form 24Q / 26Q)',
    dueDate: 'July 31',
    category: 'tds_compliance',
    applicableEntities: ['proprietorship', 'partnership', 'llp', 'pvt_ltd', 'public_ltd'],
    description: 'File quarterly statement of tax deducted at source for salaries and contractor/professional payments.',
    penaltyClause: 'Late filing fee of ₹200 per day under Section 234E.',
    actionRequired: 'Reconcile challans via TRACES and submit e-TDS return.',
  },
];

export function getUpcomingDeadlines(entityType?: EntityType): TaxCalendarEvent[] {
  if (!entityType) return STATUTORY_TAX_CALENDAR;
  return STATUTORY_TAX_CALENDAR.filter(e => e.applicableEntities.includes(entityType));
}
