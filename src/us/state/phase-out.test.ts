import { describe, expect, it } from "bun:test"
import type { UsStateLinearPhaseOut } from "./parameters/phase-out-types"
import { applyUsStatePhaseOut } from "./phase-out"

const START = 40_000
const WIDTH = 55_000

function rule(reductionStep?: number): UsStateLinearPhaseOut {
	const start = {
		single: START,
		married_filing_jointly: 80_000,
		married_filing_separately: START,
		head_of_household: 60_000,
	}
	const width = {
		single: WIDTH,
		married_filing_jointly: 110_000,
		married_filing_separately: WIDTH,
		head_of_household: 82_500,
	}
	return { kind: "linear", start, width, ...(reductionStep === undefined ? {} : { reductionStep }) }
}

const AMOUNT = 1_500_000

describe("state phase-out reduction rounding", () => {
	it("keeps the whole amount at the start threshold", () => {
		expect(applyUsStatePhaseOut(AMOUNT, 4_000_000, "single", rule(10), "USD")).toBe(AMOUNT)
	})

	it("removes the exact share when no reduction step is set", () => {
		// 1,500,000 x 2,000,000 / 5,500,000 = 545,454.55, rounded to 545,455 cents.
		expect(applyUsStatePhaseOut(AMOUNT, 6_000_000, "single", rule(), "USD")).toBe(954_545)
	})

	it("floors the statutory share, not the cent-rounded share, to the step", () => {
		// 1,500,000 x 2,001,999 / 5,500,000 = 545,999.73 cents: cent rounding would cross the
		// $5,460 boundary, while the statutory "next lowest ten dollars" is $5,450.
		expect(applyUsStatePhaseOut(AMOUNT, 6_001_999, "single", rule(10), "USD")).toBe(955_000)
	})

	it("removes the whole amount at the end of the band, even off the step grid", () => {
		expect(applyUsStatePhaseOut(AMOUNT + 37, 9_500_000, "single", rule(10), "USD")).toBe(0)
	})

	it("rejects a zero reduction step", () => {
		expect(() => applyUsStatePhaseOut(AMOUNT, 6_000_000, "single", rule(0), "USD")).toThrow()
	})
})
