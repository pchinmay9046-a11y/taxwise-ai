/**
 * TaxWise AI - Full-Stack Express Server with Gemini AI Tax Assistant
 * Serves Vite dev middleware on port 3000 and provides secure backend API routes
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

// Intelligent deterministic fallback when Gemini API key is unconfigured or offline
function generateRuleBasedTaxAdvice(message: string, profile: any, calculation: any, strategies: any[]): string {
  const query = (message || '').toLowerCase();
  const formatInr = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const revenue = formatInr(profile?.grossRevenue || 0);
  const profit = formatInr(calculation?.preliminaryAccountingProfit || 0);
  const taxable = formatInr(calculation?.taxableIncome || 0);
  const tax = formatInr(calculation?.totalTaxLiability || 0);
  const entity = profile?.entityType || 'business';

  if (query.includes('1.2') || query.includes('crore') || query.includes('revenue vs profit')) {
    return `### ₹1.2 Crore Scenario Analysis (Revenue vs Profit vs Taxable Income)

In Indian tax law, **Revenue**, **Accounting Profit**, and **Taxable Income** are distinct:
1. **Gross Revenue**: ${revenue} — Total sales before operating deductions.
2. **Accounting Profit**: ${profit} — Revenue minus allowable operating expenses (${formatInr(calculation?.allowableOperatingExpenses || 0)}) and depreciation (${formatInr(calculation?.depreciationClaimed || 0)}).
3. **Taxable Income**: ${taxable} — Profit adjusted for tax disallowances and eligible deductions.
4. **Current Baseline Tax**: ${tax} (Effective rate: ${calculation?.effectiveTaxRate || 0}%).

**Key Takeaway**: You do **not** pay tax on ₹1.2 Crore of revenue. Tax is computed solely on the net taxable profit after legitimate business expenses, Section 32 depreciation, and statutory allowances.`;
  }

  if (query.includes('equipment') || query.includes('capex') || query.includes('depreciation') || query.includes('computer')) {
    return `### Section 32 Capital Expenditure & Depreciation Strategy

- **Statutory Rate**: 40% WDV on computers, laptops, servers, and business software; 15% on plant and machinery.
- **Timing Rule (October 3)**:
  - If acquired and put to use **on or before October 3** (>= 180 days in the FY), you receive the full **100%** of the statutory rate in Year 1.
  - If put to use **after October 3** (< 180 days), only **50%** is allowed in Year 1, with the balance carried forward to subsequent years.
- **Tax Benefit**: For every ₹1,00,000 spent on eligible IT equipment before Oct 3, taxable income drops by ₹40,000, saving up to ₹12,480 to ₹15,600 in cash taxes depending on your entity slab.
- **Documentation**: Tax invoice with company GSTIN, asset register entry, and installation/delivery proof.`;
  }

  if (query.includes('entity') || query.includes('pvt ltd') || query.includes('llp') || query.includes('115baa')) {
    return `### Entity & Tax Regime Comparison

- **Sole Proprietorship**: Slabs up to 30% under Section 115BAC (New Regime), plus up to 25% surcharge for high income. No corporate legal shield.
- **Partnership / LLP**: Flat 30% base tax (+ 12% surcharge if taxable income > ₹1 Crore + 4% cess = 34.94%). You can deduct partner remuneration under Section 40(b) (90% on first ₹3L, 60% on balance) and 12% interest on capital.
- **Private Limited under Section 115BAA**: Flat concessional base tax of 22% + mandatory 10% surcharge + 4% cess = **25.17% effective rate**. Minimum Alternate Tax (MAT u/s 115JB) is 100% exempt.
- **Recommendation**: For businesses generating over ₹25–₹30 Lakhs in retained taxable profit, migrating to a Private Limited entity under Section 115BAA locks in a predictable 25.17% rate for expansion capital.`;
  }

  if (query.includes('document') || query.includes('accountant') || query.includes('audit')) {
    return `### Documents to Prepare for Your Chartered Accountant

1. **Financial Statements**: Trial balance, P&L account, balance sheet, and general ledger.
2. **Bank Statements & Reconciliation**: For all current accounts from April 1 to March 31.
3. **Section 43B(h) MSME File**: Udyam registration certificates for all micro/small vendors and payment date proof.
4. **Section 32 Asset Invoices**: GST tax invoices for capital expenditure with delivery challans and installation dates.
5. **Section 80CCD(2) NPS Receipts**: Monthly electronic contribution challans and PRAN schedules.
6. **Form 26AS & AIS/TIS**: Downloaded from the Income Tax portal to verify TDS/TCS and Advance Tax challans.
7. **Form 10DA / Form 10-IC** (if claiming Section 80JJAA or Section 115BAA).`;
  }

  // General tailored advice
  const topStrats = (strategies || []).filter((s: any) => s.eligible).slice(0, 3);
  const stratList = topStrats.length > 0
    ? topStrats.map((s: any, idx: number) => `${idx + 1}. **${s.title}** (${s.legalSection}): Saves ~${formatInr(s.estimatedTaxSaved)} in taxes with a net benefit of ${formatInr(s.netEconomicBenefit)}.`).join('\n')
    : 'No active strategies selected.';

  return `### TaxWise AI Advisory for ${profile?.name || 'Your Business'}

Based on your current profile (${entity.toUpperCase()}, FY: ${profile?.financialYear || 'FY 2025-26'}):
- **Gross Revenue**: ${revenue}
- **Accounting Profit**: ${profit}
- **Taxable Income**: ${taxable}
- **Estimated Baseline Tax**: ${tax} (Effective Rate: ${calculation?.effectiveTaxRate || 0}%)

#### Top 3 Verified Tax-Saving Strategies Available:
${stratList}

#### Immediate Action Checklist:
- Verify that all Micro and Small vendor invoices are settled within 15/45 days under **Section 43B(h)** to avoid mandatory expense disallowances.
- Review capital expenditure timing: Acquire and put into use necessary hardware before **October 3** for full 40% Section 32 depreciation.
- Schedule your **Advance Tax installments** (June 15, Sept 15, Dec 15, March 15) to avoid Section 234B and 234C interest penalties.`;
}

// POST /api/tax-assistant
app.post('/api/tax-assistant', async (req, res) => {
  try {
    const { message, profile, calculation, strategies, conversationHistory } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Clean deterministic advisory fallback
      const reply = generateRuleBasedTaxAdvice(message, profile, calculation, strategies);
      return res.json({ reply, source: 'rule_engine' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are TaxWise AI, an expert chartered accountant, Indian business tax planning specialist, and corporate financial advisor.
Your guidance is strictly grounded in the Indian Income-tax Act, 1961, recent Finance Acts, CBDT circulars, and official guidance on incometax.gov.in.

Current Context:
- Local time: October 2026. Financial Year: ${profile?.financialYear || 'FY 2025-26 (AY 2026-27)'}.
- Business Name: ${profile?.name || 'Client Business'}
- Entity Type: ${profile?.entityType || 'proprietorship'}
- Tax Regime: ${profile?.taxRegime || 'new'}
- Gross Revenue: ₹${(profile?.grossRevenue || 0).toLocaleString('en-IN')}
- Allowable Expenses: ₹${(calculation?.allowableOperatingExpenses || 0).toLocaleString('en-IN')}
- Accounting Profit: ₹${(calculation?.preliminaryAccountingProfit || 0).toLocaleString('en-IN')}
- Taxable Income: ₹${(calculation?.taxableIncome || 0).toLocaleString('en-IN')}
- Current Estimated Tax: ₹${(calculation?.totalTaxLiability || 0).toLocaleString('en-IN')} (Effective Rate: ${calculation?.effectiveTaxRate || 0}%)
- Net Tax Payable/Refund: ₹${(calculation?.netTaxPayableOrRefund || 0).toLocaleString('en-IN')}
- Available Strategies: ${JSON.stringify((strategies || []).filter((s: any) => s.eligible).map((s: any) => ({
        title: s.title,
        section: s.legalSection,
        taxSaved: s.estimatedTaxSaved,
        spending: s.requiredSpending,
        netBenefit: s.netEconomicBenefit
      })))}

Guidelines:
1. Never confuse revenue with profit. Explicitly distinguish Revenue from Taxable Income.
2. Only recommend legitimate, lawful Indian tax provisions (Section 32, Section 80CCD(2), Section 80JJAA, Section 40(b), Section 43B(h), Section 115BAA, Section 44AD/44ADA, Section 80G).
3. Do not promise that tax can be eliminated to zero unless statutory exemptions strictly apply.
4. Include quantitative impact using the client's actual numbers.
5. Provide markdown formatted responses with clear headings, bullet points, and required documentation.
6. Keep recommendations actionable, professional, and compliant.`;

      const promptText = `User Question: "${message}"\n\nProvide clear, structured, legally verified tax advisory referencing our actual financial numbers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + '\n\n' + promptText }] }
        ],
      });

      const reply = response.text || generateRuleBasedTaxAdvice(message, profile, calculation, strategies);
      return res.json({ reply, source: 'gemini_api' });
    } catch (aiError: any) {
      console.warn('Gemini API call failed, falling back to rule engine:', aiError?.message);
      const reply = generateRuleBasedTaxAdvice(message, profile, calculation, strategies);
      return res.json({ reply, source: 'rule_engine' });
    }
  } catch (err: any) {
    console.error('Tax Assistant Error:', err);
    res.status(500).json({ error: 'Internal server error processing tax query' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TaxWise AI server running at http://localhost:${port}`);
  });
}

startServer();
