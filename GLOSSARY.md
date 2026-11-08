# Tax Core

A pure, deterministic, multi-jurisdiction individual income tax calculation domain covering statutory rules across jurisdictions (Thailand Revenue Code and United States Federal, FICA/SECA, and State tax systems).

## Core Concepts

**Jurisdiction**:
A sovereign country (identified by ISO 3166-1 alpha-2 code, such as `TH` or `US`) whose statutory tax code governs a tax calculation.
_Avoid_: Locale, country code, region

**Tax System**:
A self-contained statutory ruleset for a specific Jurisdiction across supported Tax Years, accepting a jurisdiction-specific filing input and returning a standardized Tax Result.
_Avoid_: Calculator, plugin, engine instance

**Tax Year**:
The statutory calendar period (e.g., `2026`) whose brackets, caps, exemptions, and rates govern a filing.
_Avoid_: Fiscal year, current year

**Minor Unit**:
The smallest indivisible integer subunit of an ISO 4217 currency (such as `satang` for `THB` or `cent` for `USD`) in which all internal monetary arithmetic is performed.
_Avoid_: Float, decimal amount

**Statutory Cap**:
The maximum allowable monetary amount or percentage permitted by law for an expense deduction, allowance, or credit, above which any requested input is clamped rather than rejected.
_Avoid_: Hard validation limit, maximum input

**Tax Result**:
The standardized output envelope produced by any Tax System, containing top-level summary figures (gross income, total deductions, taxable income, total tax, net tax payable or refund, effective rate, marginal rate, currency) and a jurisdiction-specific Breakdown.
_Avoid_: Tax response, calculation summary

**Breakdown**:
The itemized audit trail inside a Tax Result showing requested versus allowed deductions, bracket-by-bracket slices, special regime computations, and credits.
_Avoid_: Debug log, trace

## Thailand (`TH`)

**Assessable Income**:
Gross income categorized under Thailand Revenue Code Section 40(1) through Section 40(8) before expense deductions or allowances.
_Avoid_: Gross salary, total earnings

**Expense Deduction**:
The statutory reduction subtracted directly from each Section 40(1)–40(8) Assessable Income category (either via a standard statutory percentage or actual substantiated expenses) before allowances are applied.
_Avoid_: Allowance, write-off

**Allowance**:
A statutory personal, family, insurance, social security, housing, retirement fund, or donation reduction (ค่าลดหย่อน) subtracted after Expense Deductions to arrive at Net Taxable Income.
_Avoid_: Expense deduction, credit

**Retirement Cluster**:
The group of Thai long-term retirement allowances (RMF, SSF, PVD, GPF, National Savings Fund, and pension life insurance) that are subject to both individual statutory limits and a combined 500,000 THB ceiling.
_Avoid_: Investment deduction

**Separate Sheet**:
The optional Section 48(5) computation (`ใบแนบ ภ.ง.ด.90/91`) that taxes one-time severance and retirement lump sums independently from regular Assessable Income. Labour-law severance (the default payment type) is first exempted up to the lesser of 400 days of last wage and 600,000 THB at any length of service; retirement payments get no exemption. With 5+ years of service the remainder takes 7,000 THB per year plus 50% expense and the schedule without a 0% tier; under 5 years only the non-exempt remainder joins Section 40(1).
_Avoid_: Bonus calculation

**Final Withholding Election**:
A taxpayer's statutory option under Section 40(4) or Section 48 to let source-withheld tax on interest, dividends, or property transfers stand as final rather than including the income in regular progressive brackets.
_Avoid_: Tax exemption

**Real Estate Transfer**:
The Section 48(4) separate computation for inherited, gifted, or sold property, applied to the official appraised value (ราคาประเมินทุนทรัพย์), not the sale price. Expense is a flat 50% for inheritance or gift, or the holding-year table for commercial acquisitions (92% at 1 year down to 50% at 8+), never both. Holding years above 10 count as 10. The net gain is averaged over the holding years, taxed on the schedule without a 0% tier (5% from the first baht), multiplied back by the holding years, and clamped at 20% of the gross transfer value.
_Avoid_: Capital gains tax

**Dividend Tax Credit**:
The Section 47 bis gross-up and tax credit granted when a taxpayer elects to include dividends from Thai corporate entities in regular progressive calculation to recover underlying corporate income tax. The grossed-up amount (dividend + credit) stays in Section 40(4) assessable income and the credit offsets tax payable.
_Avoid_: Dividend deduction

**Minimum Gross Tax**:
The Section 48(2) alternative calculation equal to 0.5% of gross Assessable Income under Sections 40(2)–40(8) when such income is at least 120,000 THB, payable only if it exceeds 5,000 THB and exceeds progressive bracket tax.
_Avoid_: Alternative minimum tax

## United States (`US`)

**Adjusted Gross Income (AGI)**:
Total gross income minus statutory Schedule 1 Above-the-Line Adjustments, serving as the baseline for deduction floors, phase-outs, and state tax starting points.
_Avoid_: Net income

**Above-the-Line Adjustment**:
A statutory Schedule 1 reduction (such as traditional IRA, HSA, student loan interest, or 50% of Self-Employment Tax) subtracted from gross income to compute AGI regardless of whether the taxpayer itemizes.
_Avoid_: Itemized deduction

**Standard vs. Itemized Election**:
The choice between the fixed statutory Standard Deduction (adjusted for filing status, age 65+, and blindness) and the sum of Schedule A Itemized Deductions (subject to AGI floors and the SALT cap).
_Avoid_: Personal allowance

**Preferential Stacking**:
The statutory method that stacks Long-Term Capital Gains and Qualified Dividends on top of ordinary taxable income so they are taxed at preferential 0%, 15%, or 20% thresholds rather than ordinary brackets.
_Avoid_: Flat capital gains tax

**Alternative Minimum Tax (AMT)**:
The parallel federal tax calculation (Form 6251) that adds back preference items (such as SALT deductions and ISO bargain elements), applies the AMT exemption with phase-out, and taxes the remainder at 26% or 28%.
_Avoid_: Minimum gross tax

**Payroll & Self-Employment Tax (FICA / SECA)**:
Mandatory federal Social Security, Medicare, and Additional Medicare taxes levied on W-2 earned wages (FICA) and net self-employment earnings (Schedule SE / SECA) independently of income tax brackets.
_Avoid_: Withholding tax

**State Income Tax**:
The optional layer that applies one of the 50 state individual income tax systems or the District of Columbia to a federal adjusted gross income starting point, using that state's own standard deduction, personal/dependent exemptions or credits, and statutory bracket table. Nine states impose no wage income tax; the remaining states use either a single flat rate or a graduated schedule, with high-income surtaxes where enacted.
_Avoid_: Local tax, municipal tax

**State Parameter Verification**:
The per-state record (`UsStateVerification`) of how far a state's 2026 rates, brackets, deductions and exemptions have been checked against an official document: `official`, `partial`, `reported` or `unconfirmed`, mirrored row by row in `references/SOURCES.md` so a library consumer can see what to trust.
_Avoid_: Confidence score, accuracy flag

**South Carolina Income Adjusted Deduction (SCIAD)**:
The post-2025 South Carolina deduction (15,000 USD single and separate, 22,500 USD head of household, 30,000 USD joint) that replaced the federal standard deduction, reduced linearly as federal AGI rises above its start and floored to the next lowest 10 USD.
_Avoid_: Standard deduction, personal exemption

**State Surtax**:
An additional statutory rate applied above a state taxable-income threshold on top of the regular state bracket tax, such as the Massachusetts 4% millionaire surtax or the California 1% mental health services surtax.
_Avoid_: Marginal rate, bracket rate
