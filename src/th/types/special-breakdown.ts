import type { BracketEvaluationResult } from "../../core/brackets"
import type {
	ThFinalWithholdingElection,
	ThRealEstateAcquisitionType,
	ThRealEstateExpenseBasis,
	ThSeparateSheetPaymentType,
} from "./special-input"

/**
 * Final withholding detail for one Section 40(4) source. Units: THB major units; `rate` is a ratio.
 *
 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
 */
export interface ThFinalWithholdingSourceBreakdown {
	readonly election: ThFinalWithholdingElection
	readonly amount: number
	readonly rate: number
	/** Tax withheld at source; zero unless the election is `"final"`. */
	readonly tax: number
}

/**
 * Section 40(4) final withholding audit trail. Units: THB major units.
 *
 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
 */
export interface ThFinalWithholdingBreakdown {
	readonly interest: ThFinalWithholdingSourceBreakdown
	readonly dividends: ThFinalWithholdingSourceBreakdown
	readonly digitalAssets: ThFinalWithholdingSourceBreakdown
	/** Sum of amounts elected `"final"` (excluded from regular brackets). */
	readonly totalAmount: number
	/** Sum of tax withheld on the amounts elected `"final"`. */
	readonly totalTax: number
}

/**
 * Section 47 bis dividend tax credit audit trail. Units: THB major units; `corpTaxRate` is a ratio.
 *
 * @statute Thailand Revenue Code Section 47 bis.
 */
export interface ThDividendTaxCreditBreakdown {
	/** True when a corporate tax rate was supplied for included dividends. */
	readonly isApplicable: boolean
	/** Dividends included in regular brackets, before gross-up. */
	readonly dividendAmount: number
	readonly corpTaxRate: number
	/** `dividendAmount * rate / (1 - rate)`; offsets tax payable. */
	readonly credit: number
	/** `dividendAmount + credit`; the amount added to Section 40(4) assessable income. */
	readonly grossedUpAmount: number
}

/**
 * Section 48(5) separate sheet audit trail. Units: THB major units.
 *
 * @statute Thailand Revenue Code Section 48(5), Section 42(1).
 */
export interface ThSeparateSheetBreakdown {
	readonly amount: number
	readonly yearsOfService: number
	readonly lastDailyWage: number
	/** True when `yearsOfService` meets the statutory minimum for the separate sheet. */
	readonly isEligible: boolean
	/** Lump sum remaining after the exemption, folded into Section 40(1) when ineligible. */
	readonly addedToSection40_1: number
	/** `lastDailyWage * 400` (zero for retirement payments). */
	readonly wageBasedCap: number
	readonly exemptionCeiling: number
	/** `"retirement"` payments receive no exemption. */
	readonly paymentType: ThSeparateSheetPaymentType
	/** Applied to severance at any length of service; zero for retirement payments. */
	readonly exemption: number
	readonly remainder: number
	readonly fixedExpense: number
	readonly percentageExpense: number
	readonly netTaxable: number
	readonly brackets: BracketEvaluationResult
	readonly tax: number
}

/**
 * Section 48(4) real estate transfer audit trail. Units: THB major units.
 *
 * Tax is computed exactly as `years * bracketTax(netGain / years)` by evaluating `netGain`
 * against the schedule without a 0% tier with every bound multiplied by `effectiveHoldingYears`,
 * so `brackets` slices carry those scaled bounds. `annualGain` and `annualTax` are the per-year
 * figures rounded to the satang for display only; `taxBeforeCap` is the exact figure and may
 * differ from `annualTax * effectiveHoldingYears` by under one satang per year.
 *
 * @statute Thailand Revenue Code Section 48(4), Section 42(5).
 */
export interface ThRealEstateBreakdown {
	/** Official appraised value (ราคาประเมินทุนทรัพย์) supplied by the caller. */
	readonly grossTransferValue: number
	readonly acquisitionType: ThRealEstateAcquisitionType
	/** Which expense applied: flat inheritance/gift rate or the holding-year table. */
	readonly expenseBasis: ThRealEstateExpenseBasis
	/** Holding years as supplied by the caller. */
	readonly requestedHoldingYears: number
	/** Holding years used in the calculation: `requestedHoldingYears` capped at 10. */
	readonly effectiveHoldingYears: number
	/** Statutory expense deduction rate (ratio) for the acquisition type and holding period. */
	readonly expenseRate: number
	readonly expense: number
	readonly netGain: number
	/** `netGain / effectiveHoldingYears`, rounded half-up to the satang (display only). */
	readonly annualGain: number
	/** Brackets applied to `netGain` with bounds scaled by `effectiveHoldingYears`. */
	readonly brackets: BracketEvaluationResult
	/** `taxBeforeCap / effectiveHoldingYears`, rounded half-up to the satang (display only). */
	readonly annualTax: number
	readonly taxBeforeCap: number
	/** Cap on tax: the statutory share of `grossTransferValue`. */
	readonly taxCap: number
	readonly wasClamped: boolean
	readonly tax: number
}

/**
 * Combined liability audit trail. Units: THB major units.
 *
 * @statute Thailand Revenue Code Sections 40(4), 47 bis, 48(1)–(5).
 */
export interface ThCombinedTaxBreakdown {
	/** Regular + separate sheet + real estate + final withholding, before credits. */
	readonly totalCombinedTax: number
	/** Total less final withholding, dividend credit, and input withholding; negative is a refund. */
	readonly netTaxPayable: number
}
