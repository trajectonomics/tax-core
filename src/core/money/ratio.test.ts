import { describe, expect, it } from "bun:test"
import { TaxValidationError } from "./errors"
import { rateFraction } from "./ratio"

describe("rateFraction", () => {
	it("keeps the decimal digits of a statutory rate as numerator over scale", () => {
		expect(rateFraction(0.35)).toEqual({ num: 35, den: 100 })
		expect(rateFraction(0.005)).toEqual({ num: 5, den: 1000 })
		expect(rateFraction(0.3)).toEqual({ num: 3, den: 10 })
	})

	it("handles whole-number boundaries", () => {
		expect(rateFraction(0)).toEqual({ num: 0, den: 1 })
		expect(rateFraction(1)).toEqual({ num: 1, den: 1 })
	})

	it("expands exponent notation into a plain decimal", () => {
		expect(rateFraction(1e-7)).toEqual({ num: 1, den: 10_000_000 })
	})

	it("rejects rates outside the statutory ratio range", () => {
		expect(() => rateFraction(-0.1)).toThrow(TaxValidationError)
		expect(() => rateFraction(1.1)).toThrow(TaxValidationError)
		expect(() => rateFraction(Number.NaN)).toThrow(TaxValidationError)
	})
})
