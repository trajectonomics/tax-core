/**
 * Tally labels a TH 2026 Levy reads from income Flows (`gross` basis).
 *
 * Purpose: One label per assessable income class under Section 40(1)–(8), with Section 40(4)
 * split per source because each source carries its own final-withholding election at emit time.
 * Math: No arithmetic; the label selects which tally a Measure reads.
 * Units: Dimensionless label string; the tallied amount is integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40(1)–(8), 40(4), 50(2)(g).
 */
export const ThLevyIncomeLabel = {
	/** Section 40(1) employment income. */
	Section40_1: "income.section40_1",
	/** Section 40(2) service and hire-of-work income. */
	Section40_2: "income.section40_2",
	/** Section 40(3) royalties, goodwill, and copyright income. */
	Section40_3: "income.section40_3",
	/** Section 40(4) income with no source-specific election. */
	Section40_4Other: "income.section40_4",
	/** Section 40(4) interest, elected final or included at emit time. */
	Section40_4Interest: "income.section40_4.interest",
	/** Section 40(4) dividends, elected final or included at emit time. */
	Section40_4Dividends: "income.section40_4.dividends",
	/** Section 40(4) digital asset income, elected final or included at emit time. */
	Section40_4DigitalAssets: "income.section40_4.digitalAssets",
	/** Section 40(5) building rental income. */
	Section40_5Building: "income.section40_5.building",
	/** Section 40(5) agricultural land rental income. */
	Section40_5AgriculturalLand: "income.section40_5.agriculturalLand",
	/** Section 40(5) non-agricultural land rental income. */
	Section40_5NonAgriculturalLand: "income.section40_5.nonAgriculturalLand",
	/** Section 40(5) vehicle rental income. */
	Section40_5Vehicles: "income.section40_5.vehicles",
	/** Section 40(5) other rental income. */
	Section40_5Other: "income.section40_5.other",
	/** Section 40(6) medical profession income. */
	Section40_6Medical: "income.section40_6.medical",
	/** Section 40(6) law profession income. */
	Section40_6Law: "income.section40_6.law",
	/** Section 40(6) engineering profession income. */
	Section40_6Engineering: "income.section40_6.engineering",
	/** Section 40(6) architecture profession income. */
	Section40_6Architecture: "income.section40_6.architecture",
	/** Section 40(6) accounting profession income. */
	Section40_6Accounting: "income.section40_6.accounting",
	/** Section 40(6) fine arts profession income. */
	Section40_6FineArts: "income.section40_6.fineArts",
	/** Section 40(6) other liberal profession income. */
	Section40_6Other: "income.section40_6.other",
	/** Section 40(7) contracting income. */
	Section40_7: "income.section40_7",
	/** Section 40(8) general business and commerce income. */
	Section40_8General: "income.section40_8.general",
	/** Section 40(8) entertainer income (tiered expense rate). */
	Section40_8Entertainer: "income.section40_8.entertainer",
} as const

/**
 * Union of {@link ThLevyIncomeLabel} values.
 *
 * Purpose: Narrow type for the labels a caller may put on an income Flow.
 * Math: No arithmetic.
 * Units: Dimensionless label string.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40(1)–(8), 40(4).
 */
export type ThLevyIncomeLabel = (typeof ThLevyIncomeLabel)[keyof typeof ThLevyIncomeLabel]

/**
 * Tally labels a TH 2026 Levy reads from contribution Flows (`funded` basis).
 *
 * Purpose: One label per contribution-driven retirement allowance.
 * Math: No arithmetic; the label selects which tally a Measure reads.
 * Units: Dimensionless label string; the tallied amount is integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export const ThLevyContributionLabel = {
	/** RMF contribution. */
	Rmf: "allowance.retirement.rmf",
	/** SSF contribution. */
	Ssf: "allowance.retirement.ssf",
	/** PVD contribution. */
	Pvd: "allowance.retirement.pvd",
	/** GPF contribution. */
	Gpf: "allowance.retirement.gpf",
	/** National Savings Fund contribution. */
	Nsf: "allowance.retirement.nsf",
	/** Pension life insurance premium. */
	PensionLifeInsurance: "allowance.retirement.pension_life",
	/** ThaiESG fund contribution. */
	ThaiEsg: "allowance.thai_esg",
} as const

/**
 * Union of {@link ThLevyContributionLabel} values.
 *
 * Purpose: Narrow type for the labels a caller may put on a contribution Flow.
 * Math: No arithmetic.
 * Units: Dimensionless label string.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export type ThLevyContributionLabel =
	(typeof ThLevyContributionLabel)[keyof typeof ThLevyContributionLabel]

/**
 * Every income tally label the emitter reads, in Section 40 order.
 *
 * Purpose: Ordered contract a caller can iterate to label or audit income Flows.
 * Math: No arithmetic.
 * Units: Dimensionless label strings.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40(1)–(8), 40(4).
 */
export const TH_LEVY_INCOME_LABELS: readonly ThLevyIncomeLabel[] = [
	ThLevyIncomeLabel.Section40_1,
	ThLevyIncomeLabel.Section40_2,
	ThLevyIncomeLabel.Section40_3,
	ThLevyIncomeLabel.Section40_4Other,
	ThLevyIncomeLabel.Section40_4Interest,
	ThLevyIncomeLabel.Section40_4Dividends,
	ThLevyIncomeLabel.Section40_4DigitalAssets,
	ThLevyIncomeLabel.Section40_5Building,
	ThLevyIncomeLabel.Section40_5AgriculturalLand,
	ThLevyIncomeLabel.Section40_5NonAgriculturalLand,
	ThLevyIncomeLabel.Section40_5Vehicles,
	ThLevyIncomeLabel.Section40_5Other,
	ThLevyIncomeLabel.Section40_6Medical,
	ThLevyIncomeLabel.Section40_6Law,
	ThLevyIncomeLabel.Section40_6Engineering,
	ThLevyIncomeLabel.Section40_6Architecture,
	ThLevyIncomeLabel.Section40_6Accounting,
	ThLevyIncomeLabel.Section40_6FineArts,
	ThLevyIncomeLabel.Section40_6Other,
	ThLevyIncomeLabel.Section40_7,
	ThLevyIncomeLabel.Section40_8General,
	ThLevyIncomeLabel.Section40_8Entertainer,
]

/**
 * Every contribution tally label the emitter reads, in retirement-cluster order.
 *
 * Purpose: Ordered contract a caller can iterate to label or audit contribution Flows.
 * Math: No arithmetic.
 * Units: Dimensionless label strings.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export const TH_LEVY_CONTRIBUTION_LABELS: readonly ThLevyContributionLabel[] = [
	ThLevyContributionLabel.Rmf,
	ThLevyContributionLabel.Ssf,
	ThLevyContributionLabel.Pvd,
	ThLevyContributionLabel.Gpf,
	ThLevyContributionLabel.Nsf,
	ThLevyContributionLabel.PensionLifeInsurance,
	ThLevyContributionLabel.ThaiEsg,
]
