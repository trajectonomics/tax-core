/**
 * Election values for a Section 40(4) source: keep source withholding as final tax, or include
 * the income in the regular progressive computation. Plain `"final"`/`"include"` strings are
 * accepted wherever {@link ThFinalWithholdingElection} is expected.
 *
 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
 */
export const ThFinalWithholdingElection = {
	Final: "final",
	Include: "include",
} as const

/** Union of {@link ThFinalWithholdingElection} values. */
export type ThFinalWithholdingElection =
	(typeof ThFinalWithholdingElection)[keyof typeof ThFinalWithholdingElection]

/**
 * Section 40(4) interest or digital asset income with an optional final withholding election.
 * Units: THB major units.
 *
 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
 */
export interface ThSection40_4Source {
	/** Gross amount received, in THB (non-negative, finite). */
	readonly amount: number
	/** Defaults to `"include"`. */
	readonly election?: ThFinalWithholdingElection
}

/**
 * Section 40(4) dividend income with election and optional Thai corporate tax rate.
 * Units: THB major units; `corpTaxRate` is a ratio.
 *
 * @statute Thailand Revenue Code Sections 40(4), 47 bis.
 */
export interface ThSection40_4Dividend extends ThSection40_4Source {
	/** Corporate income tax rate in [0, 1) paid by the distributing company (Section 47 bis). */
	readonly corpTaxRate?: number
}

/**
 * Structured Section 40(4) input splitting interest, dividends, and digital assets.
 * Units: THB major units.
 *
 * @statute Thailand Revenue Code Section 40(4).
 */
export interface ThSection40_4Input {
	/** Other Section 40(4) income always included in regular brackets. */
	readonly amount?: number
	/** Interest; a bare number means included in regular brackets. */
	readonly interest?: number | ThSection40_4Source
	/** Dividends; a bare number means included, with no Section 47 bis credit. */
	readonly dividends?: number | ThSection40_4Dividend
	/** Digital asset income; a bare number means included in regular brackets. */
	readonly digitalAssets?: number | ThSection40_4Source
}

/**
 * Kind of Section 48(5) lump sum. Only labour-law `"severance"` carries the 400-day / 600,000 THB
 * exemption; other `"retirement"` payments (e.g. a pension fund lump sum) get none.
 * Plain `"severance"`/`"retirement"` strings are accepted wherever
 * {@link ThSeparateSheetPaymentType} is expected.
 *
 * @statute Thailand Revenue Code Section 48(5); Section 42(1) (severance exemption).
 */
export const ThSeparateSheetPaymentType = {
	Severance: "severance",
	Retirement: "retirement",
} as const

/** Union of {@link ThSeparateSheetPaymentType} values. */
export type ThSeparateSheetPaymentType =
	(typeof ThSeparateSheetPaymentType)[keyof typeof ThSeparateSheetPaymentType]

/**
 * Section 48(5) one-time severance or retirement lump sum.
 * Units: THB major units; `yearsOfService` is a count.
 *
 * @statute Thailand Revenue Code Section 48(5), Section 42(1).
 */
export interface ThSeparateSheetInput {
	/** Lump sum received, in THB. */
	readonly amount: number
	/** Completed years of service (non-negative safe integer; callers round part-years up). */
	readonly yearsOfService: number
	/** Last daily wage in THB, basis for the 400-day exemption. */
	readonly lastDailyWage: number
	/** Defaults to `"severance"`; `"retirement"` payments receive no exemption. */
	readonly paymentType?: ThSeparateSheetPaymentType
}

/**
 * How a Section 48(4) property was acquired. Inherited or gifted property takes a flat 50%
 * expense; commercially acquired (or other) property takes the holding-year table. The two are
 * never combined. Plain `"commercial"`/`"inheritance_or_gift"` strings are accepted wherever
 * {@link ThRealEstateAcquisitionType} is expected.
 *
 * @statute Thailand Revenue Code Section 48(4); Ministerial Regulation No. 126.
 */
export const ThRealEstateAcquisitionType = {
	Commercial: "commercial",
	InheritanceOrGift: "inheritance_or_gift",
} as const

/** Union of {@link ThRealEstateAcquisitionType} values. */
export type ThRealEstateAcquisitionType =
	(typeof ThRealEstateAcquisitionType)[keyof typeof ThRealEstateAcquisitionType]

/**
 * Which expense deduction a Section 48(4) computation used, reported in the breakdown.
 *
 * @statute Thailand Revenue Code Section 48(4); Ministerial Regulation No. 126.
 */
export const ThRealEstateExpenseBasis = {
	HoldingPeriodTable: "holding_period_table",
	FlatInheritance: "flat_inheritance",
} as const

/** Union of {@link ThRealEstateExpenseBasis} values. */
export type ThRealEstateExpenseBasis =
	(typeof ThRealEstateExpenseBasis)[keyof typeof ThRealEstateExpenseBasis]

/**
 * Section 48(4) real estate transfer subject to separate computation.
 * Units: THB major units; `holdingYears` is a count.
 *
 * @statute Thailand Revenue Code Section 48(4).
 */
export interface ThRealEstateTransferInput {
	/**
	 * Official appraised value in THB (ราคาประเมินทุนทรัพย์, Section 49 bis), not the actual sale
	 * price.
	 */
	readonly grossTransferValue: number
	/**
	 * Years the property was held (positive safe integer). Callers round part-years up; the
	 * calculation counts at most 10 years.
	 */
	readonly holdingYears: number
	/** Defaults to `"commercial"`; `"inheritance_or_gift"` uses a flat 50% expense. */
	readonly acquisitionType?: ThRealEstateAcquisitionType
}
