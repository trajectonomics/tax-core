/**
 * Diagnostic and reporting field identifiers for state income tax calculations.
 */
export enum UsStateField {
	BracketBound = "state.bracketBound",
	Agi = "state.agi",
	StandardDeduction = "state.standardDeduction",
	PersonalExemption = "state.personalExemption",
	DependentExemption = "state.dependentExemption",
	TaxableIncome = "state.taxableIncome",
	BracketTax = "state.bracketTax",
	Surtax = "state.surtax",
	SurtaxThreshold = "state.surtaxThreshold",
	PhaseOutThreshold = "state.phaseOutThreshold",
	PhaseOutReductionStep = "state.phaseOutReductionStep",
	CreditsPersonal = "state.credits.personal",
	CreditsDependent = "state.credits.dependent",
	CreditsClaimedNonRefundable = "state.credits.claimedNonRefundable",
	CreditsNonRefundable = "state.credits.nonRefundable",
	CreditsRefundable = "state.credits.refundable",
	Withholding = "state.withholding",
	TaxBeforeCredits = "state.taxBeforeCredits",
	TotalTax = "state.totalTax",
	NetTaxPayable = "state.netTaxPayable",
}
