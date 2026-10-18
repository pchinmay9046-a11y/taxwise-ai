/**
 * Indian Income Tax Slabs, Surcharge, Marginal Relief & Cess Calculator
 * Governed by Income-tax Act, 1961 and Finance Acts
 */

import type { EntityType, TaxRegime } from './types.ts';

export interface SlabCalculationOutput {
  baseTax: number;
  rebate87A: number;
  surcharge: number;
  marginalRelief: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
}

/**
 * Computes individual tax under Section 115BAC (New Tax Regime)
 * Default for AY 2025-26 and AY 2026-27
 */
export function calculateIndividualNewRegimeTax(taxableIncome: number): SlabCalculationOutput {
  if (taxableIncome <= 0) {
    return { baseTax: 0, rebate87A: 0, surcharge: 0, marginalRelief: 0, cess: 0, totalTax: 0, effectiveRate: 0 };
  }

  let baseTax = 0;
  // Slabs under 115BAC
  // 0 - 3,00,000: Nil
  // 3,00,001 - 7,00,000: 5% (max 20,000)
  // 7,00,001 - 10,00,000: 10% (max 30,000)
  // 10,00,001 - 12,00,000: 15% (max 30,000)
  // 12,00,001 - 15,00,000: 20% (max 60,000)
  // Above 15,00,000: 30%

  if (taxableIncome > 1500000) {
    baseTax += (taxableIncome - 1500000) * 0.30;
    baseTax += 300000 * 0.20; // 12L - 15L
    baseTax += 200000 * 0.15; // 10L - 12L
    baseTax += 300000 * 0.10; // 7L - 10L
    baseTax += 400000 * 0.05; // 3L - 7L
  } else if (taxableIncome > 1200000) {
    baseTax += (taxableIncome - 1200000) * 0.20;
    baseTax += 200000 * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 1000000) {
    baseTax += (taxableIncome - 1000000) * 0.15;
    baseTax += 300000 * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 700000) {
    baseTax += (taxableIncome - 700000) * 0.10;
    baseTax += 400000 * 0.05;
  } else if (taxableIncome > 300000) {
    baseTax += (taxableIncome - 300000) * 0.05;
  }

  // Section 87A Rebate in New Regime:
  // If total income <= 7,00,000, 100% tax rebate (max 25,000)
  let rebate87A = 0;
  if (taxableIncome <= 700000) {
    rebate87A = baseTax;
    baseTax = 0;
  } else if (taxableIncome > 700000 && taxableIncome < 727778) {
    // Marginal relief for Section 87A in new regime:
    // Tax payable cannot exceed income exceeding ₹7,00,000
    const excessIncome = taxableIncome - 700000;
    if (baseTax > excessIncome) {
      rebate87A = baseTax - excessIncome;
      baseTax = excessIncome;
    }
  }

  // Surcharge for Individuals in New Regime
  let surchargeRate = 0;
  let surchargeThreshold = 0;
  if (taxableIncome > 20000000) {
    surchargeRate = 0.25; // 25% for > 2 Cr in New Regime
    surchargeThreshold = 20000000;
  } else if (taxableIncome > 10000000) {
    surchargeRate = 0.15; // 15% for > 1 Cr to 2 Cr
    surchargeThreshold = 10000000;
  } else if (taxableIncome > 5000000) {
    surchargeRate = 0.10; // 10% for > 50L to 1 Cr
    surchargeThreshold = 5000000;
  }

  let surcharge = baseTax * surchargeRate;
  let marginalRelief = 0;

  // Marginal relief check for surcharge
  if (surchargeRate > 0 && surchargeThreshold > 0) {
    // Tax on threshold
    const taxAtThreshold = calculateIndividualNewRegimeTax(surchargeThreshold).baseTax;
    // Lower surcharge rate at threshold
    let lowerSurchargeRate = 0;
    if (surchargeThreshold === 20000000) lowerSurchargeRate = 0.15;
    else if (surchargeThreshold === 10000000) lowerSurchargeRate = 0.10;
    else if (surchargeThreshold === 5000000) lowerSurchargeRate = 0;

    const totalTaxAtThreshold = taxAtThreshold * (1 + lowerSurchargeRate);
    const totalTaxWithSurcharge = baseTax + surcharge;
    const excessOverThreshold = taxableIncome - surchargeThreshold;

    const maxAllowedTax = totalTaxAtThreshold + excessOverThreshold;
    if (totalTaxWithSurcharge > maxAllowedTax) {
      marginalRelief = totalTaxWithSurcharge - maxAllowedTax;
      surcharge = Math.max(0, surcharge - marginalRelief);
    }
  }

  const taxBeforeCess = baseTax + surcharge;
  const cess = Math.round(taxBeforeCess * 0.04);
  const totalTax = Math.round(taxBeforeCess + cess);
  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    surcharge: Math.round(surcharge),
    marginalRelief: Math.round(marginalRelief),
    cess,
    totalTax,
    effectiveRate: Number(effectiveRate.toFixed(2)),
  };
}

/**
 * Computes individual tax under Old Tax Regime
 */
export function calculateIndividualOldRegimeTax(taxableIncome: number): SlabCalculationOutput {
  if (taxableIncome <= 0) {
    return { baseTax: 0, rebate87A: 0, surcharge: 0, marginalRelief: 0, cess: 0, totalTax: 0, effectiveRate: 0 };
  }

  let baseTax = 0;
  // 0 - 2,50,000: Nil
  // 2,50,001 - 5,00,000: 5% (max 12,500)
  // 5,00,001 - 10,00,000: 20% (max 1,00,000)
  // Above 10,00,000: 30%

  if (taxableIncome > 1000000) {
    baseTax += (taxableIncome - 1000000) * 0.30;
    baseTax += 500000 * 0.20;
    baseTax += 250000 * 0.05;
  } else if (taxableIncome > 500000) {
    baseTax += (taxableIncome - 500000) * 0.20;
    baseTax += 250000 * 0.05;
  } else if (taxableIncome > 250000) {
    baseTax += (taxableIncome - 250000) * 0.05;
  }

  let rebate87A = 0;
  if (taxableIncome <= 500000) {
    rebate87A = Math.min(baseTax, 12500);
    baseTax -= rebate87A;
  }

  let surchargeRate = 0;
  let surchargeThreshold = 0;
  if (taxableIncome > 50000000) {
    surchargeRate = 0.37;
    surchargeThreshold = 50000000;
  } else if (taxableIncome > 20000000) {
    surchargeRate = 0.25;
    surchargeThreshold = 20000000;
  } else if (taxableIncome > 10000000) {
    surchargeRate = 0.15;
    surchargeThreshold = 10000000;
  } else if (taxableIncome > 5000000) {
    surchargeRate = 0.10;
    surchargeThreshold = 5000000;
  }

  let surcharge = baseTax * surchargeRate;
  let marginalRelief = 0;

  if (surchargeRate > 0 && surchargeThreshold > 0) {
    const taxAtThreshold = calculateIndividualOldRegimeTax(surchargeThreshold).baseTax;
    let lowerRate = 0;
    if (surchargeThreshold === 50000000) lowerRate = 0.25;
    else if (surchargeThreshold === 20000000) lowerRate = 0.15;
    else if (surchargeThreshold === 10000000) lowerRate = 0.10;
    else if (surchargeThreshold === 5000000) lowerRate = 0;

    const totalAtThreshold = taxAtThreshold * (1 + lowerRate);
    const totalWithSurcharge = baseTax + surcharge;
    const excess = taxableIncome - surchargeThreshold;
    const maxAllowed = totalAtThreshold + excess;

    if (totalWithSurcharge > maxAllowed) {
      marginalRelief = totalWithSurcharge - maxAllowed;
      surcharge = Math.max(0, surcharge - marginalRelief);
    }
  }

  const taxBeforeCess = baseTax + surcharge;
  const cess = Math.round(taxBeforeCess * 0.04);
  const totalTax = Math.round(taxBeforeCess + cess);
  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    baseTax: Math.round(baseTax),
    rebate87A: Math.round(rebate87A),
    surcharge: Math.round(surcharge),
    marginalRelief: Math.round(marginalRelief),
    cess,
    totalTax,
    effectiveRate: Number(effectiveRate.toFixed(2)),
  };
}

/**
 * Computes Partnership Firm or LLP Tax
 * Flat 30% base tax + 12% surcharge if income > 1 Crore + 4% cess
 */
export function calculateFirmOrLLPTax(taxableIncome: number): SlabCalculationOutput {
  if (taxableIncome <= 0) {
    return { baseTax: 0, rebate87A: 0, surcharge: 0, marginalRelief: 0, cess: 0, totalTax: 0, effectiveRate: 0 };
  }

  const baseTax = taxableIncome * 0.30;
  let surcharge = 0;
  let marginalRelief = 0;

  if (taxableIncome > 10000000) {
    surcharge = baseTax * 0.12;
    // Marginal relief check at 1 Crore:
    // Tax + Surcharge cannot exceed: (Tax on 1 Crore) + (Taxable Income - 1 Crore)
    const taxOn1Cr = 10000000 * 0.30; // 30,00,000
    const excessIncome = taxableIncome - 10000000;
    const maxAllowed = taxOn1Cr + excessIncome;

    if ((baseTax + surcharge) > maxAllowed) {
      marginalRelief = (baseTax + surcharge) - maxAllowed;
      surcharge = Math.max(0, surcharge - marginalRelief);
    }
  }

  const taxBeforeCess = baseTax + surcharge;
  const cess = Math.round(taxBeforeCess * 0.04);
  const totalTax = Math.round(taxBeforeCess + cess);
  const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;

  return {
    baseTax: Math.round(baseTax),
    rebate87A: 0,
    surcharge: Math.round(surcharge),
    marginalRelief: Math.round(marginalRelief),
    cess,
    totalTax,
    effectiveRate: Number(effectiveRate.toFixed(2)),
  };
}

/**
 * Computes Domestic Company Tax
 * Under Section 115BAA: 22% flat + 10% surcharge + 4% cess = 25.168% effective
 * Under Normal: 25% (if turnover <= 400 Cr) or 30% + surcharge (7% > 1Cr, 12% > 10Cr) + 4% cess
 */
export function calculateCompanyTax(
  taxableIncome: number,
  regime: '115BAA' | 'normal_company',
  turnover: number = 0
): SlabCalculationOutput {
  if (taxableIncome <= 0) {
    return { baseTax: 0, rebate87A: 0, surcharge: 0, marginalRelief: 0, cess: 0, totalTax: 0, effectiveRate: 0 };
  }

  if (regime === '115BAA') {
    // Section 115BAA: 22% basic tax, 10% mandatory surcharge, 4% cess
    const baseTax = taxableIncome * 0.22;
    const surcharge = baseTax * 0.10;
    const taxBeforeCess = baseTax + surcharge;
    const cess = Math.round(taxBeforeCess * 0.04);
    const totalTax = Math.round(taxBeforeCess + cess);
    const effectiveRate = (totalTax / taxableIncome) * 100;

    return {
      baseTax: Math.round(baseTax),
      rebate87A: 0,
      surcharge: Math.round(surcharge),
      marginalRelief: 0,
      cess,
      totalTax,
      effectiveRate: Number(effectiveRate.toFixed(3)),
    };
  }

  // Normal corporate tax: 25% if turnover <= 400 Cr, otherwise 30%
  const rate = turnover <= 4000000000 ? 0.25 : 0.30;
  const baseTax = taxableIncome * 0;
  let surchargeRate = 0;
  let surchargeThreshold = 0;

  if (taxableIncome > 100000000) { // > 10 Crore
    surchargeRate = 0.12;
    surchargeThreshold = 100000000;
  } else if (taxableIncome > 10000000) { // > 1 Crore
    surchargeRate = 0.07;
    surchargeThreshold = 10000000;
  }

  const normalBaseTax = taxableIncome * rate;
  let surcharge = normalBaseTax * surchargeRate;
  let marginalRelief = 0;

  if (surchargeRate > 0 && surchargeThreshold > 0) {
    const taxAtThreshold = surchargeThreshold * rate;
    const lowerSurcharge = surchargeThreshold === 100000000 ? 0.07 : 0;
    const totalAtThreshold = taxAtThreshold * (1 + lowerSurcharge);
    const totalWithSurcharge = normalBaseTax + surcharge;
    const excess = taxableIncome - surchargeThreshold;
    const maxAllowed = totalAtThreshold + excess;

    if (totalWithSurcharge > maxAllowed) {
      marginalRelief = totalWithSurcharge - maxAllowed;
      surcharge = Math.max(0, surcharge - marginalRelief);
    }
  }

  const taxBeforeCess = normalBaseTax + surcharge;
  const cess = Math.round(taxBeforeCess * 0.04);
  const totalTax = Math.round(taxBeforeCess + cess);
  const effectiveRate = (totalTax / taxableIncome) * 100;

  return {
    baseTax: Math.round(normalBaseTax),
    rebate87A: 0,
    surcharge: Math.round(surcharge),
    marginalRelief: Math.round(marginalRelief),
    cess,
    totalTax,
    effectiveRate: Number(effectiveRate.toFixed(2)),
  };
}

/**
 * Route entity and regime to the exact statutory tax calculation
 */
export function calculateTaxForEntity(
  entityType: EntityType,
  regime: TaxRegime,
  taxableIncome: number,
  turnover: number = 0
): SlabCalculationOutput {
  switch (entityType) {
    case 'proprietorship':
      return regime === 'old'
        ? calculateIndividualOldRegimeTax(taxableIncome)
        : calculateIndividualNewRegimeTax(taxableIncome);

    case 'partnership':
    case 'llp':
      return calculateFirmOrLLPTax(taxableIncome);

    case 'pvt_ltd':
    case 'public_ltd':
      return calculateCompanyTax(
        taxableIncome,
        regime === '115BAA' ? '115BAA' : 'normal_company',
        turnover
      );

    default:
      return calculateIndividualNewRegimeTax(taxableIncome);
  }
}
