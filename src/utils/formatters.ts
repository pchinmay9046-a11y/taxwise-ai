/**
 * TaxWise AI - Formatting Utilities for Indian Financial Data
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
  }
  if (absAmount >= 100000) {
    return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
  }
  if (absAmount >= 1000) {
    return `${sign}₹${(absAmount / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
}

export function formatPercent(rate: number): string {
  if (isNaN(rate) || rate === null || rate === undefined) return '0%';
  return `${rate.toFixed(1)}%`;
}
