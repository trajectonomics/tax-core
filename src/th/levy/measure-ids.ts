/**
 * Diagnostic field identifiers for values passed to the Levy measure builder.
 *
 * Purpose: Names the invalid input on every emit-time validation error.
 * Math: No arithmetic; diagnostic paths only.
 * Units: Dimensionless field paths.
 * Throws: Nothing; consumed by `TaxValidationError`.
 * @statute Jurisdiction-neutral input bound (AGENTS rule 8); no statutory citation.
 */
export enum ThLevyField {
	MeasureId = "levy.measure.id",
	MeasureDue = "levy.measure.due",
	ConstValue = "levy.measure.const.value",
	ScaleNum = "levy.measure.scale.num",
	ScaleDen = "levy.measure.scale.den",
}

/**
 * Audited Measure ids a TH 2026 Levy exposes by name.
 *
 * Purpose: Lets callers and tests compare each intermediate statutory figure without knowing
 * the emit order.
 * Math: No arithmetic; Measure ids only.
 * Units: The referenced Measures are integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export enum ThLevyMeasureId {
	AssessableTotal = "assessable.total",
	GrossNonEmployment = "assessable.non_employment",
	ExpensesTotal = "expenses.total",
	AllowancesFixed = "allowances.fixed",
	RetirementCluster = "allowances.retirement_cluster",
	ThaiEsg = "allowances.thai_esg",
	Donations = "allowances.donations",
	AllowancesTotal = "allowances.total",
	NetTaxableIncome = "taxable.income",
	ProgressiveTax = "tax.progressive",
	MinimumGrossTax = "tax.minimum",
	RegularTax = "tax.regular",
	FinalWithholdingTax = "tax.final_withholding",
	DividendCredit = "credit.dividend",
	TotalTax = "tax.total",
	NetTaxPayable = "tax.net_payable",
}
