import type {
	ThAllowancesInput,
	ThExpenseElection,
	ThFilingStatus,
	ThFinalWithholdingElection,
} from "../types"
import type { ThLevyMonthDay } from "./graph-types"

/**
 * Fixed allowance amounts frozen into a TH 2026 Levy at emit time.
 *
 * Purpose: These allowances depend only on the taxpayer profile, so the emitter bakes them as
 * fixed Measures. Contribution-driven allowances (RMF, SSF, PVD, GPF, NSF, pension life insurance,
 * ThaiESG) are excluded on purpose: they arrive as `funded` Flow tallies instead.
 * Math: Sums the calculator's family and insurance stages into one fixed Measure.
 * Units: THB major units, except counts (children, parents, disabled persons).
 * Throws: TaxValidationError at emit time for a negative or non-finite amount or an invalid count.
 * @statute Thailand Revenue Code Section 47.
 */
export type ThLevyAllowances = Pick<
	ThAllowancesInput,
	| "personal"
	| "spouse"
	| "children"
	| "parents"
	| "disabledCareCount"
	| "socialSecurity"
	| "lifeInsurance"
	| "healthInsurance"
	| "parentHealthInsurance"
	| "spouseLifeInsurance"
	| "mortgageInterest"
	| "donation2x"
	| "donation1x"
>

/**
 * Expense election fixed for one electable income item at emit time.
 *
 * Purpose: Chooses the standard statutory percentage or an actual substantiated expense.
 * Math: No arithmetic; selects which expense Measure graph is emitted.
 * Units: `actualExpense` is THB major units.
 * Throws: TaxValidationError at emit time if the actual expense is invalid.
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46.
 */
export interface ThLevyExpenseChoice {
	/** Defaults to `"standard"`. */
	readonly election?: ThExpenseElection | undefined
	/** Actual substantiated expense in THB; used only when `election` is `"actual"`. */
	readonly actualExpense?: number | undefined
}

/**
 * Expense elections frozen into the Levy, per Section 40 income item with a standard/actual choice.
 *
 * Purpose: Records which items use the standard statutory percentage and which use actuals.
 * Math: No arithmetic; each choice selects an emitted Measure branch.
 * Units: Actual expense amounts are THB major units.
 * Throws: TaxValidationError at emit time if an actual expense is invalid.
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46; Royal Decree No. 11.
 */
export interface ThLevyExpenseElections {
	/** Section 40(3) royalties and goodwill. */
	readonly section40_3?: ThLevyExpenseChoice | undefined
	/** Section 40(5) rental income, per property class. */
	readonly section40_5?: {
		readonly building?: ThLevyExpenseChoice | undefined
		readonly agriculturalLand?: ThLevyExpenseChoice | undefined
		readonly nonAgriculturalLand?: ThLevyExpenseChoice | undefined
		readonly vehicles?: ThLevyExpenseChoice | undefined
		readonly other?: ThLevyExpenseChoice | undefined
	}
	/** Section 40(6) liberal professions, per profession class. */
	readonly section40_6?: {
		readonly medical?: ThLevyExpenseChoice | undefined
		readonly law?: ThLevyExpenseChoice | undefined
		readonly engineering?: ThLevyExpenseChoice | undefined
		readonly architecture?: ThLevyExpenseChoice | undefined
		readonly accounting?: ThLevyExpenseChoice | undefined
		readonly fineArts?: ThLevyExpenseChoice | undefined
		readonly other?: ThLevyExpenseChoice | undefined
	}
	/** Section 40(7) contracting with materials. */
	readonly section40_7?: ThLevyExpenseChoice | undefined
	/** Section 40(8) business income, split by expense schedule. */
	readonly section40_8?: {
		readonly general?: ThLevyExpenseChoice | undefined
		readonly entertainer?: ThLevyExpenseChoice | undefined
	}
}

/**
 * Section 40(4) elections frozen into the Levy. All sources default to `"include"`.
 *
 * Purpose: Fixes final withholding versus regular-bracket inclusion per source.
 * Math: No arithmetic; each election selects the withholding a Measure applies.
 * Units: `dividendCorpTaxRate` is a dimensionless ratio in [0, 1).
 * Throws: TaxValidationError at emit time if the corporate rate is outside [0, 1).
 * @statute Thailand Revenue Code Sections 40(4), 47 bis, 50(2)(g), 57 ter.
 */
export interface ThLevySection40_4Elections {
	/** Interest: final withholding versus regular brackets. */
	readonly interest?: ThFinalWithholdingElection | undefined
	/** Dividends: final withholding versus regular brackets. */
	readonly dividends?: ThFinalWithholdingElection | undefined
	/** Digital asset income: final withholding versus regular brackets. */
	readonly digitalAssets?: ThFinalWithholdingElection | undefined
	/** Section 47 bis corporate rate for included dividends in [0, 1); omit for no credit. */
	readonly dividendCorpTaxRate?: number | undefined
}

/**
 * Levy identity and Settlement period frozen at emit time.
 *
 * Purpose: Lets a caller name the Levy and override the default filing window.
 * Math: No arithmetic; identity and calendar dates only.
 * Units: Not monetary; the dates are month/day pairs.
 * Throws: Nothing; sim-core's `check()` validates the dates.
 * @statute Thailand Revenue Code Section 56 (annual return filing period).
 */
export interface ThLevyIdentity {
	/** Levy id, defaulting to `"th-2026-pit"`. */
	readonly id?: string | undefined
	/** Period start, defaulting to 1 January (the calendar tax year). */
	readonly period?: ThLevyMonthDay | undefined
	/** Settlement date, defaulting to 31 March after the tax year. */
	readonly settlement?: ThLevyMonthDay | undefined
}

/**
 * The taxpayer profile an emitted TH 2026 Levy is specialised to.
 *
 * Purpose: Holds everything that must be fixed at emit time: filing status, fixed allowances,
 * expense elections, Section 40(4) elections, and the Levy identity. Income and contribution
 * amounts are not part of the profile; they arrive as Flow tallies at evaluation time.
 * Math: No arithmetic; every monetary amount is an emit-time constant.
 * Units: Monetary profile amounts are THB major units.
 * Throws: TaxValidationError at emit time for any invalid allowance, donation, expense, or rate.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2), 56.
 */
export interface ThLevyProfile {
	/** Filing status governing family allowances; defaults to `"single"`. */
	readonly filingStatus?: ThFilingStatus | undefined
	/** Fixed allowances and donation requests; contribution allowances come from tallies. */
	readonly allowances?: ThLevyAllowances | undefined
	/** Standard-versus-actual expense elections; omitted items use the standard deduction. */
	readonly expenses?: ThLevyExpenseElections | undefined
	/** Section 40(4) final-withholding and Section 47 bis elections. */
	readonly section40_4?: ThLevySection40_4Elections | undefined
	/** Levy id, period, and settlement; each has a statutory default. */
	readonly levy?: ThLevyIdentity | undefined
}
