import { validateRate } from "./validate"

/**
 * Exact non-negative integer fraction `num / den` with `den` at least 1.
 *
 * Purpose: Carries a statutory rate as integers into exact rational arithmetic.
 * Math: `num / den` equals the rate; the fraction is not reduced.
 * Units: Dimensionless rate ratio (0.35 is 35/100); no currency.
 * Throws: Nothing; construction happens in {@link rateFraction}.
 * @statute Jurisdiction-neutral arithmetic type; no statutory citation.
 */
export interface RateFraction {
	/** Numerator, equal to the rate's decimal digits without the point. */
	readonly num: number
	/** Denominator, `10` to the power of the rate's decimal places. */
	readonly den: number
}

/**
 * Converts a statutory rate ratio into the exact integer fraction it was written as.
 *
 * Purpose: Lets exact rational arithmetic consume rates without re-parsing them per call site.
 * Math: Reads the decimal string (expanding exponent notation), so `0.35` becomes `35/100`;
 * the fraction is not reduced, so `den` always matches the written precision.
 * Units: Dimensionless ratio in, integer numerator/denominator out.
 * Throws: TaxValidationError if the rate is NaN, non-finite, or outside [0, 1].
 *
 * @param rate Statutory rate ratio (e.g. `0.05` for 5%).
 * @param field Diagnostic field name reported on failure.
 * @statute Jurisdiction-neutral exact arithmetic helper; Thailand Revenue Code Sections 47 bis,
 * 48(1), 48(2) are the first consumers.
 */
export function rateFraction(rate: number, field = "rate"): RateFraction {
	validateRate(rate, field)
	const text = rate.toString().includes("e")
		? rate.toFixed(10).replace(/\.?0+$/, "")
		: rate.toString()
	const parts = text.split(".")
	const decimals = parts[1] ? parts[1].length : 0
	return {
		num: Number(parts.join("")),
		den: 10 ** decimals,
	}
}
