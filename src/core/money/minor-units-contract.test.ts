import { describe, expect, it } from "bun:test"
import { TaxValidationError } from "./errors"
import { fromMinorUnits, toMinorUnits } from "./minor-units"

/**
 * Pins the public failure contract of the money conversions.
 *
 * Purpose: The arithmetic now delegates to `@trajectonomics/money`, which throws its own
 * `MoneyValidationError`. These assertions prove the wrappers still rethrow `TaxValidationError`
 * with the emitted `name`, message shape, `field`, `value` and `reason` unchanged, so no consumer
 * of `@trajectonomics/tax` can tell the delegation happened.
 * Units: inputs in major units (toMinorUnits) or integer minor units (fromMinorUnits).
 */
function captured(run: () => unknown): TaxValidationError {
	try {
		run()
	} catch (error) {
		if (error instanceof TaxValidationError) return error
		throw error
	}
	throw new Error("Expected the call to throw TaxValidationError")
}

describe("Minor unit conversion failure contract", () => {
	it("reports a negative major-unit amount as TaxValidationError on the default field", () => {
		const error = captured(() => toMinorUnits(-1.14, "USD"))
		expect(error.name).toBe("TaxValidationError")
		expect(error.field).toBe("amount")
		expect(error.value).toBe(-1.14)
		expect(error.reason).toBe("Value cannot be negative")
		expect(error.message).toBe(
			"Tax validation error on field 'amount': Value cannot be negative (received: -1.14)",
		)
	})

	it("keeps the caller's diagnostic field on every failure", () => {
		expect(captured(() => toMinorUnits(-1, "THB", "grossIncome")).field).toBe("grossIncome")
		expect(captured(() => fromMinorUnits(1.5, "USD", "netTaxPayable")).field).toBe("netTaxPayable")
	})

	it("reports NaN and infinities with their existing reasons", () => {
		expect(captured(() => toMinorUnits(Number.NaN, "USD")).reason).toBe("Value cannot be NaN")
		expect(captured(() => toMinorUnits(Number.POSITIVE_INFINITY, "USD")).reason).toBe(
			"Value must be a finite number",
		)
	})

	it("reports a conversion that leaves the safe integer range", () => {
		const error = captured(() => toMinorUnits(1e16, "THB"))
		expect(error.field).toBe("amount")
		expect(error.value).toBe(1e16)
		expect(error.reason).toBe("Conversion to minor units failed or exceeded safe integer bounds")
	})

	it("reports non-integer minor units and negative minor units", () => {
		expect(captured(() => fromMinorUnits(1.5, "USD")).reason).toBe(
			"Minor units amount must be a safe integer",
		)
		const negative = captured(() => fromMinorUnits(-114, "USD"))
		expect(negative.field).toBe("minorUnits")
		expect(negative.reason).toBe("Value cannot be negative")
	})

	it("still converts once allowNegative is set", () => {
		expect(toMinorUnits(-1.14, "USD", "amount", { allowNegative: true })).toBe(-114)
		expect(fromMinorUnits(-114, "USD", "minorUnits", { allowNegative: true })).toBe(-1.14)
	})

	it("rethrows an unexpected failure unchanged instead of relabelling it", () => {
		const hostileOptions = {
			get allowNegative(): boolean {
				throw new RangeError("options getter exploded")
			},
		}
		expect(() => toMinorUnits(-1, "USD", "amount", hostileOptions)).toThrow(RangeError)
	})
})
