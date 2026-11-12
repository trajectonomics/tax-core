import type { Money, TaxSupportedCurrency } from "../money"

/**
 * Standard ISO 3166-1 alpha-2 jurisdiction country code or string literal.
 */
export type JurisdictionCode = "TH" | "US" | (string & {})

/**
 * Standardized TaxResult envelope returned by all jurisdiction calculation engines.
 */
export interface TaxResult<
	C extends TaxSupportedCurrency = TaxSupportedCurrency,
	TBreakdown = unknown,
> {
	/** Statutory jurisdiction country code (e.g. TH, US). */
	readonly jurisdiction: JurisdictionCode
	/** Applicable tax year (constant, never derived from Date). */
	readonly taxYear: number
	/** Currency used in this calculation. */
	readonly currency: C
	/** Gross income assessed, in major units. */
	readonly grossIncome: Money<C>
	/** Taxable income after allowable deductions, in major units. */
	readonly taxableIncome: Money<C>
	/** Total progressive tax liability computed before credits, in major units. */
	readonly totalTax: Money<C>
	/** Effective tax rate ratio (totalTax / grossIncome). */
	readonly effectiveRate: number
	/** Marginal tax rate on the next unit of ordinary income. */
	readonly marginalRate: number
	/** Net tax payable after credits and withholding, in major units. */
	readonly netTaxPayable: Money<C>
	/** Jurisdiction-specific detailed breakdown for auditability. */
	readonly breakdown: TBreakdown
}

/**
 * Standardized contract that every jurisdiction tax engine implements.
 */
export interface TaxSystem<
	TInput,
	C extends TaxSupportedCurrency = TaxSupportedCurrency,
	TBreakdown = unknown,
> {
	readonly jurisdiction: JurisdictionCode
	readonly taxYear: number
	readonly currency: C
	calculate(input: TInput): TaxResult<C, TBreakdown>
}
