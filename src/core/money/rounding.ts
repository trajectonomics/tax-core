import { TaxValidationError } from "./errors"
import { rateFraction } from "./ratio"
import { type ValidateAmountOptions, validateIntegerMinorUnits, validateRate } from "./validate"

/**
 * Supported rounding modes for statutory tax computations.
 */
export type RoundingMode = "half-up" | "floor" | "ceil"

/**
 * Rounds a number to the nearest integer, breaking ties away from zero (standard half-up).
 *
 * Math: Rounds fractional halves away from zero (e.g. 1.5 -> 2, -1.5 -> -2).
 *
 * @param value Floating-point value.
 * @returns Rounded integer.
 */
export function roundHalfUp(value: number): number {
	if (value < 0) {
		const res = -Math.round(Math.abs(value))
		return res + 0
	}
	return Math.round(value) + 0
}

function rateRational(rate: number): { num: bigint; den: bigint } {
	const { num, den } = rateFraction(rate)
	return { num: BigInt(num), den: BigInt(den) }
}

/**
 * Applies a statutory percentage rate to an integer minor unit amount using exact rational arithmetic.
 *
 * Math: Exact rational scaling via BigInt `(minorUnits * num + modeAdjust) / den`
 * to eliminate IEEE 754 binary floating-point drift on exact statutory tax rates.
 * Units: Input and output are integer minor units (satang/cents).
 *
 * @param minorUnits Integer minor units amount.
 * @param rate Statutory rate ratio (e.g. 0.05 for 5%, 0.35 for 35%).
 * @param rounding Rounding mode (`half-up`, `floor`, or `ceil`).
 * @param options Validation options (e.g. allowNegative).
 * @returns Computed tax in integer minor units.
 * @throws {TaxValidationError} if minorUnits is not a safe integer or rate is outside [0, 1].
 * @example applyPercentage(90, 0.35) // 32 (exact statutory satang calculation)
 */
export function applyPercentage(
	minorUnits: number,
	rate: number,
	rounding: RoundingMode = "half-up",
	options?: ValidateAmountOptions,
): number {
	validateIntegerMinorUnits(minorUnits, "minorUnits", options)
	const { num, den } = rateRational(rate)
	const m = BigInt(minorUnits)
	const prod = m * num

	let result: bigint
	if (rounding === "floor") {
		result = prod >= 0n ? prod / den : (prod - (den - 1n)) / den
	} else if (rounding === "ceil") {
		result = prod >= 0n ? (prod + (den - 1n)) / den : prod / den
	} else {
		// half-up: away from zero
		result = prod >= 0n ? (prod * 2n + den) / (den * 2n) : (prod * 2n - den) / (den * 2n)
	}

	return Number(result) + 0
}

/**
 * Applies the statutory gross-up ratio `rate / (1 - rate)` to an integer minor unit amount.
 *
 * Purpose: Recovers the underlying tax from a net amount (e.g. a dividend tax credit).
 * Math: Exact BigInt rational `(minorUnits * num) / (den - num)` where `rate = num / den`,
 * rounded half-up (away from zero) so ties such as 0.5 satang never suffer binary float drift.
 * Units: Input and output are integer minor units (satang/cents).
 *
 * @param minorUnits Non-negative integer minor units amount (the net amount).
 * @param rate Underlying rate ratio in [0, 1) (e.g. 0.2 for a 20% corporate tax rate).
 * @param field Diagnostic field name reported on failure (defaults to `"minorUnits"`).
 * @returns Gross-up amount (`minorUnits * rate / (1 - rate)`) in integer minor units.
 * @throws {TaxValidationError} if minorUnits is not a non-negative safe integer, rate is outside
 * [0, 1), or the result is not a safe integer.
 * @statute Jurisdiction-neutral; Thailand Revenue Code Section 47 bis is the first consumer.
 * @example applyGrossUp(100_000, 0.2) // 25_000 (1,000.00 -> 250.00 credit at 20%)
 */
export function applyGrossUp(minorUnits: number, rate: number, field = "minorUnits"): number {
	validateIntegerMinorUnits(minorUnits, field)
	validateRate(rate, "rate")
	if (rate >= 1) {
		throw new TaxValidationError("rate", rate, "Gross-up rate must be strictly less than 1")
	}
	const { num, den } = rateRational(rate)
	const divisor = den - num
	const result = Number((BigInt(minorUnits) * num * 2n + divisor) / (divisor * 2n)) + 0
	if (!Number.isSafeInteger(result)) {
		throw new TaxValidationError(
			field,
			minorUnits,
			"Gross-up result exceeds the safe integer range",
		)
	}
	return result
}
