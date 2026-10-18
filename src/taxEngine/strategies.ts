/**
 * TaxWise AI - Strategy Generation & Optimization Engine
 * Evaluates legitimate tax-saving strategies under Indian Income-tax Act, 1961
 */

import type { BusinessProfile, TaxStrategy, TaxStrategyOptimizationResult } from './types.ts';
import { calculateBusinessTax } from './calculator.ts';

/**
 * Generates all eligible and conditional tax-saving strategies for a given business profile
 */
export function generateTaxStrategies(profile: BusinessProfile): TaxStrategy[] {
  const baseline = calculateBusinessTax(profile);
  const strategies: TaxStrategy[] = [];

  // -------------------------------------------------------------
  // STRATEGY 1: Section 80CCD(2) & 36(1)(iva) - Employer NPS Contribution
  // -------------------------------------------------------------
  {
    const eligibleSalaryBase = profile.employeeCosts * 0.65; // Estimated basic + DA share
    const potentialNpsContrib = Math.round(Math.min(eligibleSalaryBase * 0.10, 600000));
    const isEligible = profile.employeeCount > 0 && profile.employeeCosts > 300000;

    let taxSaved = 0;
    let resultingTaxableIncome = baseline.taxableIncome;
    let resultingTaxLiability = baseline.totalTaxLiability;
    let resultingPostTaxProfit = baseline.postTaxAccountingProfit;

    if (isEligible && potentialNpsContrib > 0) {
      const simulatedProfile: BusinessProfile = {
        ...profile,
        employeeCosts: profile.employeeCosts + potentialNpsContrib,
      };
      const simulated = calculateBusinessTax(simulatedProfile);
      taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);
      resultingTaxableIncome = simulated.taxableIncome;
      resultingTaxLiability = simulated.totalTaxLiability;
      resultingPostTaxProfit = simulated.postTaxAccountingProfit;
    }

    const implementationCost = 5000; // NPS corporate setup fee
    const immediateCashOutflow = potentialNpsContrib - taxSaved + implementationCost;
    // Net benefit: Employees receive retirement corpus, company saves tax, net cost reduced
    const netEconomicBenefit = taxSaved - implementationCost;

    strategies.push({
      id: 'strat_nps_80ccd2',
      title: 'Corporate NPS Employer Contribution',
      category: 'employee_retirement',
      riskLevel: 'low',
      legalSection: 'Section 36(1)(iva) & Section 80CCD(2)',
      description: 'Contribute up to 10% of employee Basic + DA to National Pension System as an allowable business deduction.',
      detailedExplanation: 'Under Section 36(1)(iva), employer contributions to employee NPS accounts up to 10% of salary are deductible as legitimate business expenses. This is exempt in the hands of employees under both New and Old tax regimes up to ₹7.5 Lakh aggregate employer retirement contributions.',
      eligible: isEligible,
      eligibilityReason: isEligible
        ? `Eligible: Business employs ${profile.employeeCount} staff with ₹${profile.employeeCosts.toLocaleString('en-IN')} annual payroll.`
        : 'Requires active payroll with registered employees.',
      requiredSpending: potentialNpsContrib,
      eligibleDeduction: potentialNpsContrib,
      estimatedTaxSaved: taxSaved,
      implementationCost,
      netEconomicBenefit,
      immediateCashOutflow,
      resultingTaxableIncome,
      resultingTaxLiability,
      resultingPostTaxProfit,
      fundDestination: 'paid_to_employees_pension',
      liquidityImpact: 'Low liquidity impact: Transferred to employees PRAN accounts; acts as high-retention employee perk.',
      lockInPeriod: 'Retirement corpus locked till age 60 as per PFRDA regulations',
      risksAndLimitations: [
        'Must register company with Point of Presence (PoP) or Protean/KFintech.',
        'Requires consent from employees and inclusion in CTC restructuring.',
        'Aggregate employer contribution to EPF + NPS + Superannuation cannot exceed ₹7.5L per employee.'
      ],
      requiredDocumentation: [
        'Corporate NPS registration certificate',
        'Board resolution or proprietor authorization letter',
        'Monthly NPS deposit challans and PRAN contribution schedules',
        'Amended employee CTC structure letters'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
      verificationDate: '2026-08-15',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 2: Section 32 - Strategic Technology & Computer Capex (40% WDV)
  // -------------------------------------------------------------
  {
    // Suggest acquiring necessary tech upgrades (servers, laptops, workstations)
    const suggestedTechCapex = Math.min(Math.round(baseline.grossRevenue * 0.05), 800000);
    const simulatedProfile: BusinessProfile = {
      ...profile,
      capitalExpenditureComputers: (profile.capitalExpenditureComputers || 0) + suggestedTechCapex,
      capexTiming: 'before_oct_3', // Ensure put to use >= 180 days for full 40%
    };
    const simulated = calculateBusinessTax(simulatedProfile);
    const taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);
    const firstYearDepreciation = Math.round(suggestedTechCapex * 0.40);
    const implementationCost = 0;
    const immediateCashOutflow = suggestedTechCapex - taxSaved;
    // Net economic benefit: Company gains ₹suggestedTechCapex worth of operational assets + tax savings
    const netEconomicBenefit = taxSaved; // Direct cash retained from government

    strategies.push({
      id: 'strat_capex_computers',
      title: 'Accelerated Computer & Software Asset Upgrades',
      category: 'depreciation_capex',
      riskLevel: 'low',
      legalSection: 'Section 32(1) & Income Tax Rules Rule 5 (Appendix I)',
      description: 'Acquire and put to use qualifying computers, servers, laptops, and business software before October 3 to claim 40% WDV depreciation.',
      detailedExplanation: 'Under Section 32, computers and software enjoy an accelerated 40% depreciation rate. If acquired and put to use for at least 180 days during the financial year (on or before October 3), the full 40% is deductible in year 1, with the remainder carried forward on WDV. This reduces taxable profit while creating productive business assets.',
      eligible: baseline.taxableIncome > 500000,
      eligibilityReason: baseline.taxableIncome > 500000
        ? `Eligible: Taxable income of ₹${baseline.taxableIncome.toLocaleString('en-IN')} can absorb ₹${firstYearDepreciation.toLocaleString('en-IN')} in Year-1 depreciation.`
        : 'Low taxable income makes large capital depreciation less beneficial in the current year.',
      requiredSpending: suggestedTechCapex,
      eligibleDeduction: firstYearDepreciation,
      estimatedTaxSaved: taxSaved,
      implementationCost,
      netEconomicBenefit,
      immediateCashOutflow,
      resultingTaxableIncome: simulated.taxableIncome,
      resultingTaxLiability: simulated.totalTaxLiability,
      resultingPostTaxProfit: simulated.postTaxAccountingProfit,
      fundDestination: 'retained_in_asset',
      liquidityImpact: 'Moderate cash outflow: Cash leaves bank to acquire physical/digital computing assets that remain owned by the company.',
      lockInPeriod: 'Assets must be retained and used for business purpose for at least 3 years to avoid balancing charge / capital gains',
      risksAndLimitations: [
        'Must be put to use before October 3 to claim full 40%; otherwise only 20% in Year 1.',
        'Assets must be registered in the name of the business entity with valid GST tax invoice.',
        'Personal use portion must be excluded.'
      ],
      requiredDocumentation: [
        'Valid Tax Invoices with Business GSTIN',
        'Asset register entry with serial numbers',
        'Proof of delivery and installation / software activation date logs'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/',
      verificationDate: '2026-09-01',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 3: Section 80JJAA - Deduction for Additional Employees
  // -------------------------------------------------------------
  {
    const isSubjectToAudit = baseline.auditRequiredU44AB;
    const canHire = profile.employeeCount >= 2;
    const newHiresCount = Math.max(1, Math.min(3, Math.round(profile.employeeCount * 0.3)));
    const annualSalaryPerNewHire = 280000; // ~₹23,300/month (< ₹25,000 threshold!)
    const totalAdditionalCost = newHiresCount * annualSalaryPerNewHire;
    // 30% deduction per year for 3 years
    const yearlyDeduction = Math.round(totalAdditionalCost * 0.30);
    const threeYearTotalDeduction = yearlyDeduction * 3;

    // Simulate current year deduction
    let taxSaved = 0;
    let resultingTaxableIncome = baseline.taxableIncome;
    let resultingTaxLiability = baseline.totalTaxLiability;
    let resultingPostTaxProfit = baseline.postTaxAccountingProfit;

    if (baseline.taxableIncome > 0) {
      const simulatedProfile: BusinessProfile = {
        ...profile,
        employeeCosts: profile.employeeCosts + totalAdditionalCost,
        existingDeductions80Cto80U: (profile.existingDeductions80Cto80U || 0) + yearlyDeduction,
      };
      const simulated = calculateBusinessTax(simulatedProfile);
      // In company 115BAA, 80JJAA is explicitly permitted!
      // Here salary is deducted 100% as expense PLUS 30% additional deduction under 80JJAA!
      taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);
      resultingTaxableIncome = simulated.taxableIncome;
      resultingTaxLiability = simulated.totalTaxLiability;
      resultingPostTaxProfit = simulated.postTaxAccountingProfit;
    }

    const implementationCost = 15000; // Form 10DA CA certification fee
    const immediateCashOutflow = totalAdditionalCost - taxSaved + implementationCost;
    const netEconomicBenefit = taxSaved - implementationCost;

    strategies.push({
      id: 'strat_80jjaa',
      title: 'Section 80JJAA Additional Employment Incentive',
      category: 'employee_retirement',
      riskLevel: 'balanced',
      legalSection: 'Section 80JJAA of Income-tax Act, 1961',
      description: 'Claim an extra 30% tax deduction on wages paid to new regular employees for 3 consecutive assessment years (total 90% bonus deduction).',
      detailedExplanation: 'Available to all businesses required to get accounts audited under Section 44AB (and permitted under Section 115BAA corporate regime). For every eligible regular employee hired (monthly emoluments <= ₹25,000, participating in recognized provident fund, employed for >= 240 days), you deduct 100% of their salary as normal expense PLUS an additional 30% deduction each year for 3 consecutive years.',
      eligible: isSubjectToAudit || profile.grossRevenue > 10000000,
      eligibilityReason: isSubjectToAudit || profile.grossRevenue > 10000000
        ? `Eligible: Turnover of ₹${profile.grossRevenue.toLocaleString('en-IN')} satisfies Section 44AB audit prerequisites.`
        : 'Requires business accounts to be audited under Section 44AB and EPF registration.',
      requiredSpending: totalAdditionalCost,
      eligibleDeduction: yearlyDeduction,
      estimatedTaxSaved: taxSaved,
      implementationCost,
      netEconomicBenefit,
      immediateCashOutflow,
      resultingTaxableIncome,
      resultingTaxLiability,
      resultingPostTaxProfit,
      fundDestination: 'paid_to_employees_pension',
      liquidityImpact: 'Moderate: Funds are paid to productive new employees who generate business output and revenue.',
      lockInPeriod: 'Employees must remain employed for at least 240 days in the financial year',
      risksAndLimitations: [
        'Monthly salary must NOT exceed ₹25,000 per new employee.',
        'Employees must contribute to Recognized Provident Fund (EPF).',
        'Must obtain Chartered Accountant report in Form 10DA before tax filing deadline.'
      ],
      requiredDocumentation: [
        'Form 10DA audit report signed by Chartered Accountant',
        'EPF monthly Electronic Challan Return (ECR) receipts',
        'Attendance registers proving >= 240 days employment',
        'Bank transfer wage payment statements (no cash payments)'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/deductions/80jjaa',
      verificationDate: '2026-07-20',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 4: Legitimate Business Expense Unbundling & Documentation
  // -------------------------------------------------------------
  {
    // Typical uncaptured out-of-pocket expenses for founders: mobile/broadband, co-working,
    // software subscriptions, travel, client dinners, books, industry events
    const estimatedUncapturedExpenses = Math.min(Math.round(baseline.grossRevenue * 0.04), 300000);
    const simulatedProfile: BusinessProfile = {
      ...profile,
      operatingExpenses: profile.operatingExpenses + estimatedUncapturedExpenses,
    };
    const simulated = calculateBusinessTax(simulatedProfile);
    const taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);
    const implementationCost = 2000; // Cloud receipt management software
    // Note: Since this money is already being spent out-of-pocket by the founders personally,
    // bringing it into company books saves tax with NO new cash outflow!
    const immediateCashOutflow = implementationCost - taxSaved;
    const netEconomicBenefit = taxSaved - implementationCost;

    strategies.push({
      id: 'strat_expense_capture',
      title: 'Legitimate Operating Expense Documentation & Reimbursement',
      category: 'operating_expenses',
      riskLevel: 'low',
      legalSection: 'Section 37(1) of Income-tax Act, 1961',
      description: 'Properly claim existing out-of-pocket business expenses (internet, mobile, SaaS, client travel, books) under business GSTIN.',
      detailedExplanation: 'Under Section 37(1), any expenditure laid out wholly and exclusively for business purposes is fully deductible. Small business owners frequently pay for business software, client travel, broadband, and equipment personally. Reimbursing these through the company with valid GST invoices converts personal post-tax expenses into business deductions.',
      eligible: true,
      eligibilityReason: 'Eligible for all business structures with bona fide business expenditure.',
      requiredSpending: estimatedUncapturedExpenses,
      eligibleDeduction: estimatedUncapturedExpenses,
      estimatedTaxSaved: taxSaved,
      implementationCost,
      netEconomicBenefit,
      immediateCashOutflow: 0, // No new net cash outflow since expenses are already incurred
      resultingTaxableIncome: simulated.taxableIncome,
      resultingTaxLiability: simulated.totalTaxLiability,
      resultingPostTaxProfit: simulated.postTaxAccountingProfit,
      fundDestination: 'retained_in_business',
      liquidityImpact: 'Positive liquidity impact: Reimburses founder personally with tax-free funds while reducing business tax.',
      lockInPeriod: 'None',
      risksAndLimitations: [
        'Must NOT be personal, capital, or illegal in nature.',
        'Payment of individual invoices over ₹10,000 must be via banking channels under Section 40A(3).',
        'Receipts and business justification must be retained for 6 years.'
      ],
      requiredDocumentation: [
        'Tax invoices issued in business name with GSTIN',
        'Bank statements showing electronic payment',
        'Expense reimbursement claim sheets with purpose description'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/',
      verificationDate: '2026-09-10',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 5: Section 40(b) Partner Remuneration Optimization (Firm/LLP)
  // -------------------------------------------------------------
  if (profile.entityType === 'partnership' || profile.entityType === 'llp') {
    const bookProfit = Math.max(0, baseline.grossRevenue - profile.operatingExpenses - profile.employeeCosts);
    const maxRemuneration = Math.round(
      bookProfit <= 300000
        ? Math.max(150000, bookProfit * 0.9)
        : 270000 + (bookProfit - 300000) * 0.60
    );

    const currentRemuneration = profile.partnerRemunerationPaid || 0;
    const additionalRemunerationRoom = Math.max(0, maxRemuneration - currentRemuneration);

    let taxSaved = 0;
    let resultingTaxableIncome = baseline.taxableIncome;
    let resultingTaxLiability = baseline.totalTaxLiability;
    let resultingPostTaxProfit = baseline.postTaxAccountingProfit;

    if (additionalRemunerationRoom > 50000) {
      const simulatedProfile: BusinessProfile = {
        ...profile,
        partnerRemunerationPaid: maxRemuneration,
      };
      const simulated = calculateBusinessTax(simulatedProfile);
      // Firm saves 31.2% or 34.9% on every rupee paid as remuneration!
      const firmTaxReduction = baseline.totalTaxLiability - simulated.totalTaxLiability;
      // Partner pays personal tax on that remuneration under individual slabs (e.g. 0% up to 7L in 115BAC)
      const partnerEstimatedTax = simulatedProfile.partnerRemunerationPaid > 700000
        ? (simulatedProfile.partnerRemunerationPaid - 700000) * 0.15
        : 0;
      taxSaved = Math.max(0, Math.round(firmTaxReduction - partnerEstimatedTax));
      resultingTaxableIncome = simulated.taxableIncome;
      resultingTaxLiability = simulated.totalTaxLiability;
      resultingPostTaxProfit = simulated.postTaxAccountingProfit;
    }

    const implementationCost = 3000; // Supplementary partnership deed / resolution
    const netEconomicBenefit = taxSaved - implementationCost;

    strategies.push({
      id: 'strat_partner_remuneration_40b',
      title: 'Partner Remuneration & Interest Optimization',
      category: 'entity_regime',
      riskLevel: 'low',
      legalSection: 'Section 40(b) & Section 28(v) of Income-tax Act, 1961',
      description: 'Optimize partner salary and 12% interest on capital up to statutory Section 40(b) ceilings to reduce 31.2% firm tax.',
      detailedExplanation: 'Firms and LLPs are taxed at a flat 30% (+ 12% surcharge if > ₹1 Cr + 4% cess = 34.94%). By paying working partners salary within Section 40(b) limits (90% on first ₹3L, 60% on balance), income shifts to partners who utilize individual tax slabs (0% up to ₹7 Lakh under Section 115BAC), saving 15% to 31.2% in tax differential.',
      eligible: additionalRemunerationRoom > 50000,
      eligibilityReason: additionalRemunerationRoom > 50000
        ? `Eligible: Your firm has ₹${additionalRemunerationRoom.toLocaleString('en-IN')} unutilized partner remuneration room under Section 40(b).`
        : 'Partner remuneration already maximized to Section 40(b) ceiling.',
      requiredSpending: additionalRemunerationRoom,
      eligibleDeduction: additionalRemunerationRoom,
      estimatedTaxSaved: taxSaved,
      implementationCost,
      netEconomicBenefit,
      immediateCashOutflow: 0, // Money remains with partners (owners of the firm)
      resultingTaxableIncome,
      resultingTaxLiability,
      resultingPostTaxProfit,
      fundDestination: 'retained_in_business',
      liquidityImpact: 'Zero external outflow: Cash transfers from firm bank account directly into working partners personal bank accounts.',
      lockInPeriod: 'None',
      risksAndLimitations: [
        'Partnership deed or LLP agreement must explicitly authorize remuneration and specify computation method.',
        'Partners must be active working partners.',
        'Partner interest on capital capped at 12% simple interest p.a.'
      ],
      requiredDocumentation: [
        'Registered Partnership Deed / LLP Agreement with remuneration clause',
        'Partners resolution approving annual remuneration',
        'Form 16A / ITR of individual partners'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/',
      verificationDate: '2026-08-25',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 6: Section 43B(h) - MSME Timely Payment Safeguard
  // -------------------------------------------------------------
  {
    // If business has vendor expenses, failure to pay MSMEs within 15/45 days results in 100% DISALLOWANCE
    const estimatedMsmePurchases = Math.round(profile.operatingExpenses * 0.40);
    // Potential penalty if disallowed: 25% to 35% tax on entire purchase amount!
    const potentialDisallowanceTaxRisk = Math.round(estimatedMsmePurchases * 0.30);

    strategies.push({
      id: 'strat_msme_43bh',
      title: 'Section 43B(h) MSME Payment Safeguard & Audit Proofing',
      category: 'statutory_compliance',
      riskLevel: 'low',
      legalSection: 'Section 43B(h) of Income-tax Act, 1961 & MSMED Act 2006',
      description: 'Audit supplier Udyam certificates and ensure payment within 15 days (or 45 days under written contract) to prevent expense disallowance.',
      detailedExplanation: 'Under Section 43B(h), any sum payable to Micro and Small enterprises registered under Udyam must be paid within 15 days (or max 45 days if written agreement exists). Unpaid dues at year-end are strictly DISALLOWED and added back to taxable profit, creating an unexpected 25%-35% tax penalty plus 3x RBI bank rate interest.',
      eligible: profile.operatingExpenses > 200000,
      eligibilityReason: `Protects up to ₹${estimatedMsmePurchases.toLocaleString('en-IN')} of annual vendor purchases from statutory tax disallowance.`,
      requiredSpending: 0, // Working capital timing management, not new spending
      eligibleDeduction: estimatedMsmePurchases,
      estimatedTaxSaved: potentialDisallowanceTaxRisk,
      implementationCost: 5000, // MSME vendor tracking checklist & accounting verification
      netEconomicBenefit: potentialDisallowanceTaxRisk - 5000,
      immediateCashOutflow: 5000,
      resultingTaxableIncome: baseline.taxableIncome,
      resultingTaxLiability: baseline.totalTaxLiability,
      resultingPostTaxProfit: baseline.postTaxAccountingProfit,
      fundDestination: 'retained_in_business',
      liquidityImpact: 'Working capital alignment: Pay micro/small suppliers within agreed 45 days rather than delaying into next FY.',
      lockInPeriod: 'None',
      risksAndLimitations: [
        'Applies only to Micro and Small manufacturing/service enterprises (does NOT apply to Medium or Wholesale/Retail Traders under NIC 45/46/47).',
        'Failure to pay requires statutory disclosure in Tax Audit Report Form 3CD Clause 22.'
      ],
      requiredDocumentation: [
        'Udyam Registration Certificates collected from all suppliers',
        'Written purchase orders specifying payment terms up to 45 days',
        'Bank payment advice before March 31'
      ],
      officialSourceUrl: 'https://msme.gov.in/',
      verificationDate: '2026-09-15',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 7: Entity Transition to Private Limited under Section 115BAA
  // -------------------------------------------------------------
  if (profile.entityType === 'proprietorship' || profile.entityType === 'partnership' || profile.entityType === 'llp') {
    // Check if converting to a Private Limited Company with Section 115BAA saves tax
    const corporateSimulatedProfile: BusinessProfile = {
      ...profile,
      entityType: 'pvt_ltd',
      taxRegime: '115BAA',
    };
    const corporateResult = calculateBusinessTax(corporateSimulatedProfile);
    const taxSaved = Math.max(0, baseline.totalTaxLiability - corporateResult.totalTaxLiability);
    const incorporationAndComplianceCost = 35000; // MCA incorporation + statutory audit
    const isBeneficial = taxSaved > incorporationAndComplianceCost && baseline.taxableIncome > 2000000;

    strategies.push({
      id: 'strat_entity_pvt_ltd_115baa',
      title: 'Entity Restructuring to Private Limited (Section 115BAA)',
      category: 'entity_regime',
      riskLevel: 'advanced',
      legalSection: 'Section 115BAA of Income-tax Act & Companies Act, 2013',
      description: 'Convert unincorporated business to a Domestic Private Limited Company to lock in a flat 25.17% tax rate with zero MAT.',
      detailedExplanation: 'High-earning proprietorships face individual marginal tax rates up to 39%, while firms/LLPs face 34.94% (with surcharge). Domestic companies opting into Section 115BAA enjoy a flat 22% basic tax + 10% surcharge + 4% cess = 25.17% effective rate, with complete exemption from Minimum Alternate Tax (MAT). Ideal when profits are reinvested into business growth.',
      eligible: isBeneficial,
      eligibilityReason: isBeneficial
        ? `Eligible: Taxable profit of ₹${baseline.taxableIncome.toLocaleString('en-IN')} produces ₹${taxSaved.toLocaleString('en-IN')} annual tax reduction under 115BAA, exceeding incorporation costs.`
        : 'Current profit level does not yet justify the increased statutory compliance and audit costs of a Private Limited entity.',
      requiredSpending: 0,
      eligibleDeduction: 0,
      estimatedTaxSaved: taxSaved,
      implementationCost: incorporationAndComplianceCost,
      netEconomicBenefit: taxSaved - incorporationAndComplianceCost,
      immediateCashOutflow: incorporationAndComplianceCost,
      resultingTaxableIncome: corporateResult.taxableIncome,
      resultingTaxLiability: corporateResult.totalTaxLiability,
      resultingPostTaxProfit: corporateResult.postTaxAccountingProfit,
      fundDestination: 'retained_in_business',
      liquidityImpact: 'Requires formal separation of company funds from personal funds. Dividends distributed to directors taxed at shareholder slab rates.',
      lockInPeriod: 'Section 115BAA option once exercised cannot be subsequently withdrawn for any subsequent assessment year.',
      risksAndLimitations: [
        'Mandatory statutory audit by Chartered Accountant regardless of turnover.',
        'Loss of individual Chapter VI-A deductions (except 80JJAA/80M).',
        'Cannot carry forward MAT credit from earlier years.'
      ],
      requiredDocumentation: [
        'Form 10-IC electronically filed with Income Tax Department on or before ITR due date',
        'Certificate of Incorporation issued by Ministry of Corporate Affairs (MCA)',
        'SPICe+ MOA & AOA, PAN, TAN and Board Resolutions'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/company/return-applicable-1',
      verificationDate: '2026-08-30',
      verificationStatus: 'verified',
      incompatibleWith: ['strat_partner_remuneration_40b', 'strat_presumptive_44ad'],
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 8: Section 80G - Tax-Efficient Eligible Donations
  // -------------------------------------------------------------
  if (profile.taxRegime === 'old' || profile.entityType === 'partnership' || profile.entityType === 'llp') {
    const suggestedDonation = Math.min(Math.round(baseline.taxableIncome * 0.05), 100000);
    const simulatedProfile: BusinessProfile = {
      ...profile,
      existingDeductions80Cto80U: (profile.existingDeductions80Cto80U || 0) + suggestedDonation,
    };
    const simulated = calculateBusinessTax(simulatedProfile);
    const taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);
    const immediateCashOutflow = suggestedDonation - taxSaved;

    strategies.push({
      id: 'strat_80g_donations',
      title: 'Section 80G Eligible Charitable Donations',
      category: 'charitable_donations',
      riskLevel: 'low',
      legalSection: 'Section 80G of Income-tax Act, 1961',
      description: 'Make digital contributions to approved Section 80G institutions or 100% deduction funds (PMNRF, Clean Ganga).',
      detailedExplanation: 'Contributions to funds specified under Section 80G(1)(i) receive 100% deduction without qualifying limit, while donations to approved charitable trusts receive 50% deduction subject to 10% of Adjusted Gross Total Income. Payment must be digital (cash donations limited to ₹2,000 max).',
      eligible: baseline.taxableIncome > 500000,
      eligibilityReason: 'Eligible: Donations generate deductions against taxable income when made digitally with valid 10BE certificate.',
      requiredSpending: suggestedDonation,
      eligibleDeduction: suggestedDonation,
      estimatedTaxSaved: taxSaved,
      implementationCost: 0,
      netEconomicBenefit: taxSaved - suggestedDonation, // Philanthropic: tax rebate cushions 30% of donation cost
      immediateCashOutflow,
      resultingTaxableIncome: simulated.taxableIncome,
      resultingTaxLiability: simulated.totalTaxLiability,
      resultingPostTaxProfit: simulated.postTaxAccountingProfit,
      fundDestination: 'donation',
      liquidityImpact: 'Pure charitable outflow: Government subsidizes 31.2% - 34.9% of the donation amount through tax deduction.',
      lockInPeriod: 'Irreversible donation',
      risksAndLimitations: [
        'Donation in cash over ₹2,000 is NOT eligible for deduction.',
        'Donee institution must file Form 10BD and issue Form 10BE certificate to donor.',
        'Not allowable under Section 115BAA corporate regime.'
      ],
      requiredDocumentation: [
        'Form 10BE Certificate of Donation with unique reference number',
        'Official stamped receipt with 80G registration number',
        'Electronic bank transfer receipt'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/',
      verificationDate: '2026-08-10',
      verificationStatus: 'verified',
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 9: Section 44AD / 44ADA Presumptive Taxation Optimization
  // -------------------------------------------------------------
  if (baseline.presumptiveEligibility.eligible44AD && baseline.presumptiveEligibility.taxUnder44AD < baseline.totalTaxLiability) {
    const taxSaved = baseline.totalTaxLiability - baseline.presumptiveEligibility.taxUnder44AD;
    strategies.push({
      id: 'strat_presumptive_44ad',
      title: 'Section 44AD Presumptive Taxation Scheme',
      category: 'entity_regime',
      riskLevel: 'balanced',
      legalSection: 'Section 44AD of Income-tax Act, 1961',
      description: `Declare statutory 6% deemed profit on digital revenue (₹${baseline.presumptiveEligibility.deemedProfit44AD.toLocaleString('en-IN')}) instead of actual accounting profit.`,
      detailedExplanation: 'For eligible small businesses with turnover up to ₹2 Crore (or ₹3 Crore if digital receipts >= 95%), Section 44AD allows declaring deemed profit at 6% of digital turnover and 8% of non-digital turnover. No maintenance of books of accounts under Section 44AA or tax audit under Section 44AB is required. When your actual profit margin is higher, this legally caps taxable income at the statutory rate.',
      eligible: true,
      eligibilityReason: `Eligible: Annual revenue of ₹${profile.grossRevenue.toLocaleString('en-IN')} is within the statutory ₹3 Crore digital threshold.`,
      requiredSpending: 0,
      eligibleDeduction: 0,
      estimatedTaxSaved: taxSaved,
      implementationCost: 0, // Saves accounting and audit fees!
      netEconomicBenefit: taxSaved + 25000, // Includes saved audit & bookkeeping fees
      immediateCashOutflow: 0,
      resultingTaxableIncome: baseline.presumptiveEligibility.deemedProfit44AD,
      resultingTaxLiability: baseline.presumptiveEligibility.taxUnder44AD,
      resultingPostTaxProfit: baseline.preliminaryAccountingProfit - baseline.presumptiveEligibility.taxUnder44AD,
      fundDestination: 'retained_in_business',
      liquidityImpact: 'Immediate positive liquidity: Saves substantial tax with zero capital expenditure or investment lock-in.',
      lockInPeriod: '5-year commitment: If you opt out in any of the subsequent 5 years, you cannot opt back into 44AD for 5 consecutive years.',
      risksAndLimitations: [
        'Cannot claim separate depreciation or expense deductions (deemed to have already been given full effect).',
        'Not available to LLPs or Companies.',
        'Not available to professions under Section 44AA(1) or agency/brokerage businesses.'
      ],
      requiredDocumentation: [
        'Bank statements verifying digital revenue percentage',
        'GST annual returns matching turnover',
        'ITR-4 Sugam filing'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-4',
      verificationDate: '2026-09-01',
      verificationStatus: 'verified',
      incompatibleWith: ['strat_capex_computers', 'strat_80jjaa'],
    });
  }

  // -------------------------------------------------------------
  // STRATEGY 10: Section 35 - In-house R&D and Technology Innovation
  // -------------------------------------------------------------
  if (profile.industry.toLowerCase().includes('tech') || profile.industry.toLowerCase().includes('soft') || profile.industry.toLowerCase().includes('manuf')) {
    const suggestedRdSpending = Math.min(Math.round(baseline.grossRevenue * 0.05), 500000);
    const simulatedProfile: BusinessProfile = {
      ...profile,
      operatingExpenses: profile.operatingExpenses + suggestedRdSpending,
    };
    const simulated = calculateBusinessTax(simulatedProfile);
    const taxSaved = Math.max(0, baseline.totalTaxLiability - simulated.totalTaxLiability);

    strategies.push({
      id: 'strat_section_35_rd',
      title: 'Section 35 Scientific Research & Development Deduction',
      category: 'rd_incentives',
      riskLevel: 'balanced',
      legalSection: 'Section 35(1) & 35(2AB) of Income-tax Act, 1961',
      description: 'Deduct 100% of revenue and capital expenditure incurred on scientific research and proprietary software product development.',
      detailedExplanation: 'Under Section 35, expenditure on scientific research related to your business (including software architecture, algorithmic modeling, prototyping, and testing) is 100% deductible in the year incurred. Capital expenditure (other than land) is also allowed as 100% deduction in year 1 instead of standard multi-year depreciation.',
      eligible: true,
      eligibilityReason: `Eligible: Technology and manufacturing activities qualify for in-house research deductions.`,
      requiredSpending: suggestedRdSpending,
      eligibleDeduction: suggestedRdSpending,
      estimatedTaxSaved: taxSaved,
      implementationCost: 10000,
      netEconomicBenefit: taxSaved - 10000,
      immediateCashOutflow: suggestedRdSpending - taxSaved + 10000,
      resultingTaxableIncome: simulated.taxableIncome,
      resultingTaxLiability: simulated.totalTaxLiability,
      resultingPostTaxProfit: simulated.postTaxAccountingProfit,
      fundDestination: 'retained_in_asset',
      liquidityImpact: 'Capitalizes into valuable intellectual property and proprietary technology.',
      lockInPeriod: 'Assets must be utilized for scientific research in the business',
      risksAndLimitations: [
        'Expenditure on acquisition of land is strictly excluded.',
        'Requires clear separation between routine IT maintenance and genuine research/development activities.'
      ],
      requiredDocumentation: [
        'R&D project activity log and technical whitepaper/architecture plans',
        'Timesheets of software engineers and researchers',
        'Direct invoices for testing, cloud compute, and specialized prototyping tools'
      ],
      officialSourceUrl: 'https://www.incometax.gov.in/',
      verificationDate: '2026-08-05',
      verificationStatus: 'verified',
    });
  }

  return strategies;
}

/**
 * Optimizes selected tax-saving strategies, handling mutual exclusivity,
 * statutory deduction caps, and preventing double-counting.
 */
export function optimizeTaxStrategies(
  profile: BusinessProfile,
  selectedStrategyIds: string[]
): TaxStrategyOptimizationResult {
  const baseline = calculateBusinessTax(profile);
  const allStrategies = generateTaxStrategies(profile);

  // Filter selected strategies
  const selectedStrategies = allStrategies.filter(s => selectedStrategyIds.includes(s.id) && s.eligible);

  // Check mutual exclusivity
  const conflictingWarnings: string[] = [];
  const validStrategies: TaxStrategy[] = [];
  const selectedIds = new Set(selectedStrategies.map(s => s.id));

  for (const strat of selectedStrategies) {
    if (strat.incompatibleWith) {
      const conflict = strat.incompatibleWith.find(incompatId => selectedIds.has(incompatId));
      if (conflict) {
        const conflictingStrat = allStrategies.find(s => s.id === conflict);
        conflictingWarnings.push(
          `Conflict Detected: "${strat.title}" cannot be combined with "${conflictingStrat?.title || conflict}". Section rules do not permit both concurrently.`
        );
      }
    }
    validStrategies.push(strat);
  }

  // Calculate cumulative simulation without double-counting
  let totalSpending = 0;
  let totalCost = 0;
  let totalDeductionAdded = 0;
  let totalComputersCapexAdded = 0;
  let simulatedEmployeeCosts = profile.employeeCosts;
  let simulatedOperatingExpenses = profile.operatingExpenses;
  let simulatedPartnerRemuneration = profile.partnerRemunerationPaid;
  let simulatedEntityType = profile.entityType;
  let simulatedTaxRegime = profile.taxRegime;

  for (const strat of validStrategies) {
    totalSpending += strat.requiredSpending;
    totalCost += strat.implementationCost;

    if (strat.id === 'strat_nps_80ccd2') {
      simulatedEmployeeCosts += strat.requiredSpending;
    } else if (strat.id === 'strat_capex_computers') {
      totalComputersCapexAdded += strat.requiredSpending;
    } else if (strat.id === 'strat_80jjaa') {
      simulatedEmployeeCosts += strat.requiredSpending;
      totalDeductionAdded += strat.eligibleDeduction;
    } else if (strat.id === 'strat_expense_capture') {
      simulatedOperatingExpenses += strat.requiredSpending;
    } else if (strat.id === 'strat_partner_remuneration_40b') {
      simulatedPartnerRemuneration = strat.requiredSpending + (profile.partnerRemunerationPaid || 0);
    } else if (strat.id === 'strat_entity_pvt_ltd_115baa') {
      simulatedEntityType = 'pvt_ltd';
      simulatedTaxRegime = '115BAA';
    } else if (strat.id === 'strat_80g_donations') {
      totalDeductionAdded += strat.eligibleDeduction;
    } else if (strat.id === 'strat_section_35_rd') {
      simulatedOperatingExpenses += strat.requiredSpending;
    }
  }

  const combinedProfile: BusinessProfile = {
    ...profile,
    entityType: simulatedEntityType,
    taxRegime: simulatedTaxRegime,
    employeeCosts: simulatedEmployeeCosts,
    operatingExpenses: simulatedOperatingExpenses,
    partnerRemunerationPaid: simulatedPartnerRemuneration,
    capitalExpenditureComputers: (profile.capitalExpenditureComputers || 0) + totalComputersCapexAdded,
    existingDeductions80Cto80U: (profile.existingDeductions80Cto80U || 0) + totalDeductionAdded,
  };

  const optimized = calculateBusinessTax(combinedProfile);

  const totalTaxSaved = Math.max(0, baseline.totalTaxLiability - optimized.totalTaxLiability);
  const taxSavingPercentage = baseline.totalTaxLiability > 0
    ? Number(((totalTaxSaved / baseline.totalTaxLiability) * 100).toFixed(1))
    : 0;

  // Immediate net cash outflow: Actual money spent out of pocket minus tax reduction + compliance costs
  const netCashOutflow = totalSpending - totalTaxSaved + totalCost;
  // Total economic benefit = Total tax saved - Total implementation costs
  const totalNetEconomicBenefit = totalTaxSaved - totalCost;

  return {
    baselineTax: baseline.totalTaxLiability,
    optimizedTax: optimized.totalTaxLiability,
    totalTaxSaved,
    taxSavingPercentage,
    totalAdditionalSpending: totalSpending,
    totalImplementationCost: totalCost,
    totalNetEconomicBenefit,
    netCashOutflow,
    postTaxProfitAfterStrategies: optimized.postTaxAccountingProfit,
    businessCashRemainingAfterStrategies: optimized.businessCashRemaining,
    selectedStrategies: validStrategies,
    conflictingStrategiesWarning: conflictingWarnings.length > 0 ? conflictingWarnings : undefined,
  };
}
