/**
 * Diagnostic field identifiers for values passed to the Levy measure builder.
 *
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
 * Audited Measure ids a TH 2026 Levy exposes by name, so callers and tests can compare each
 * intermediate statutory figure without knowing the emit order.
 *
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
