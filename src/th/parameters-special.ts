import { TH_2026_BRACKETS } from "./parameters-brackets"
import type { ThParameters } from "./parameters-types"

/**
 * Section 40(4) final withholding rates for Tax Year 2026.
 *
 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
 */
export const TH_2026_FINAL_WITHHOLDING: ThParameters["finalWithholding"] = {
	interestRate: 0.15,
	dividendRate: 0.1,
	// Assumption: the issue gives no digital asset rate; 15% mirrors interest.
	digitalAssetRate: 0.15,
}

/**
 * Section 48(5) separate sheet parameters for Tax Year 2026: exemption, expenses, and schedule.
 * The schedule is the Section 48(1) ladder without its 0% tier (same upper bounds and rates).
 *
 * @statute Thailand Revenue Code Section 48(5), Section 42(1).
 */
export const TH_2026_SEPARATE_SHEET: ThParameters["separateSheet"] = {
	minYearsOfService: 5,
	exemptionWageDays: 400,
	exemptionCeiling: 600_000,
	expensePerYearOfService: 7_000,
	remainderExpenseRate: 0.5,
	brackets: TH_2026_BRACKETS.filter((bracket) => bracket.rate > 0),
}

/**
 * Section 48(4) real estate transfer parameters for Tax Year 2026: the commercial holding-year
 * expense table, the flat inheritance/gift rate, the 10-year holding cap, the annualised schedule
 * (no 0% tier, per the Revenue Department's worked examples), and the 20% tax cap.
 *
 * @statute Thailand Revenue Code Section 48(4), Ministerial Regulation No. 126.
 */
export const TH_2026_REAL_ESTATE: ThParameters["realEstate"] = {
	expenseTable: [
		{ minYears: 1, rate: 0.92 },
		{ minYears: 2, rate: 0.84 },
		{ minYears: 3, rate: 0.77 },
		{ minYears: 4, rate: 0.71 },
		{ minYears: 5, rate: 0.65 },
		{ minYears: 6, rate: 0.6 },
		{ minYears: 7, rate: 0.55 },
		{ minYears: 8, rate: 0.5 },
	],
	inheritanceExpenseRate: 0.5,
	maxHoldingYears: 10,
	brackets: TH_2026_SEPARATE_SHEET.brackets,
	taxCapRate: 0.2,
}
