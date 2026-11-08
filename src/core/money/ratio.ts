import { TaxValidationError } from "./errors"
import { validateRate } from "./validate"

/** Diagnostic field name for a statutory rate ratio, shared by every rate consumer. */
export const RATE_FIELD = "rate"

/** Largest integer that a JavaScript number represents exactly. */
const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER)

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
 * Exact decimal expansion of a rate as a BigInt fraction.
 *
 * Purpose: Keeps percentage arithmetic exact for any rate, however many decimal places it has.
 * Math: `num / den` equals the rate; the fraction is not reduced.
 * Units: Dimensionless rate ratio; no currency.
 * Throws: TaxValidationError if the rate is NaN, non-finite, or outside [0, 1].
 * @statute Thailand Revenue Code Sections 47 bis, 48(1), 48(2).
 */
export interface RateBigFraction {
	/** Numerator, equal to the rate's decimal digits without the point. */
	readonly num: bigint
	/** Denominator, `10n` to the power of the rate's decimal places. */
	readonly den: bigint
}

/**
 * Converts a statutory rate ratio into the exact BigInt fraction it was written as.
 *
 * Purpose: Single exact parser for both the BigInt arithmetic and the emitted `scale` fraction.
 * Math: Reads the decimal string (expanding exponent notation), so `0.35` becomes `35/100`;
 * the fraction is not reduced, so `den` always matches the written precision.
 * Units: Dimensionless ratio in, integer numerator/denominator out.
 * Throws: TaxValidationError if the rate is NaN, non-finite, or outside [0, 1].
 *
 * @param rate Statutory rate ratio (e.g. `0.05` for 5%).
 * @param field Diagnostic field name reported on failure.
 * @statute Thailand Revenue Code Sections 47 bis, 48(1), 48(2).
 */
export function rateBigFraction(rate: number, field: string = RATE_FIELD): RateBigFraction {
	validateRate(rate, field)
	const text = rate.toString().includes("e")
		? rate.toFixed(10).replace(/\.?0+$/, "")
		: rate.toString()
	const parts = text.split(".")
	const decimals = parts[1] ? parts[1].length : 0
	return {
		num: BigInt(parts.join("")),
		den: 10n ** BigInt(decimals),
	}
}

/**
 * Converts a statutory rate ratio into a safe-integer fraction for a `scale` Measure.
 *
 * Purpose: Gives the emitter the exact numerator and denominator sim-core's `scale` accepts.
 * Math: Same decimal expansion as {@link rateBigFraction}, then a safe-integer bound check.
 * Units: Dimensionless ratio in, integer numerator/denominator out.
 * Throws: TaxValidationError if the rate is invalid or its decimal expansion leaves the safe
 * integer range (more than roughly 15 decimal digits).
 *
 * @param rate Statutory rate ratio (e.g. `0.05` for 5%).
 * @param field Diagnostic field name reported on failure.
 * @statute Thailand Revenue Code Sections 47 bis, 48(1), 48(2).
 */
export function rateFraction(rate: number, field: string = RATE_FIELD): RateFraction {
	const { num, den } = rateBigFraction(rate, field)
	if (num > MAX_SAFE || den > MAX_SAFE) {
		throw new TaxValidationError(field, rate, "Rate precision exceeds the safe integer range")
	}
	return { num: Number(num), den: Number(den) }
}
