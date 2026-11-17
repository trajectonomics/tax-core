import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 48(4) real estate transfer. Every case is inherited or gifted
// property, whose 50% expense the Code prints; the commercial holding-year table rests on R.D. No.
// 165, which is unsourced here, so no case asserts it.
describe("corpus: the Section 48(4) real estate transfer", () => {
	it("taxes an inherited transfer at a flat 50% expense, annualised over five years", () => {
		// derived over the documented 50% expense (the ladder has no 0% band):
		// 2,000,000 - 1,000,000 = 1,000,000 over 5 years is
		// 200,000 a year, 10,000 at 5% a year, so 50,000
		const res = runThaiCorpusCase({
			realEstateTransfer: {
				grossTransferValue: 2_000_000,
				holdingYears: 5,
				acquisitionType: "inheritance_or_gift",
			},
		})
		expect(res.breakdown.realEstate.expense).toBe(1_000_000)
		expect(res.breakdown.realEstate.netGain).toBe(1_000_000)
		expect(res.breakdown.realEstate.effectiveHoldingYears).toBe(5)
		expect(res.breakdown.realEstate.tax).toBe(50_000)
		expect(res.totalTax).toBe(thb(50_000))
	})

	it("counts a holding period beyond ten years as ten", () => {
		// derived over the documented ten-year cap: 4,000,000 - 2,000,000 = 2,000,000
		// over 10 years is 200,000 a year, 10,000 at 5% a year, so 100,000
		const res = runThaiCorpusCase({
			realEstateTransfer: {
				grossTransferValue: 4_000_000,
				holdingYears: 12,
				acquisitionType: "inheritance_or_gift",
			},
		})
		expect(res.breakdown.realEstate.requestedHoldingYears).toBe(12)
		expect(res.breakdown.realEstate.effectiveHoldingYears).toBe(10)
		expect(res.breakdown.realEstate.tax).toBe(100_000)
	})

	it("annualises into the second bracket: five years at 400,000 a year", () => {
		// derived: 400,000 a year is 15,000 at 5% plus 10,000 at 10%, 25,000 over 5 years
		const res = runThaiCorpusCase({
			realEstateTransfer: {
				grossTransferValue: 4_000_000,
				holdingYears: 5,
				acquisitionType: "inheritance_or_gift",
			},
		})
		expect(res.breakdown.realEstate.annualGain).toBe(400_000)
		expect(res.breakdown.realEstate.annualTax).toBe(25_000)
		expect(res.breakdown.realEstate.tax).toBe(125_000)
	})

	it("scales the schedule by the holding period instead of rounding each year", () => {
		// derived: 3,000,000 - 1,500,000 = 1,500,000 over 10 years is 150,000 a year,
		// 7,500 at 5% a year, so 75,000
		const res = runThaiCorpusCase({
			realEstateTransfer: {
				grossTransferValue: 3_000_000,
				holdingYears: 20,
				acquisitionType: "inheritance_or_gift",
			},
		})
		expect(res.breakdown.realEstate.tax).toBe(75_000)
		expect(res.totalTax).toBe(thb(75_000))
	})

	it("reports the 20% cap on the sale price without reaching it", () => {
		// documented (the 20% cap) over the derived ladder: 20% of 2,000,000 is 400,000, above
		// the 50,000 tax
		const res = runThaiCorpusCase({
			realEstateTransfer: {
				grossTransferValue: 2_000_000,
				holdingYears: 5,
				acquisitionType: "inheritance_or_gift",
			},
		})
		expect(res.breakdown.realEstate.taxCap).toBe(400_000)
		expect(res.breakdown.realEstate.wasClamped).toBe(false)
		expect(res.breakdown.realEstate.tax).toBe(50_000)
	})
})
