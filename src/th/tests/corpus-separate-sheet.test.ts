import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 48(5) separate sheet. Every case is a `retirement` payment,
// which receives no severance exemption: the instrument that grants that exemption is unsourced
// (references/th/SOURCES.md), so no case asserts it. The five-year eligibility condition is
// reported from the Revenue Department, so each case states that basis.
describe("corpus: the Section 48(5) separate sheet", () => {
	it("taxes an eligible lump sum separately: 7,000 a year, then 50% of the remainder", () => {
		// documented (7,000 a year and 50%), reported (five-year condition), derived (the stripped
		// ladder): 1,500,000 - 20 x 7,000 = 1,360,000, half
		// is 680,000; 300,000 at 5% (15,000) + 200,000 at 10% (20,000) + 180,000 at 15% (27,000)
		const res = runThaiCorpusCase({
			separateSheet: {
				amount: 1_500_000,
				yearsOfService: 20,
				lastDailyWage: 2_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.isEligible).toBe(true)
		expect(res.breakdown.separateSheet.fixedExpense).toBe(140_000)
		expect(res.breakdown.separateSheet.percentageExpense).toBe(680_000)
		expect(res.breakdown.separateSheet.netTaxable).toBe(680_000)
		expect(res.breakdown.separateSheet.tax).toBe(62_000)
		expect(res.totalTax).toBe(thb(62_000))
	})

	it("returns an under-five-year payment to regular Section 40(1) income untaxed", () => {
		// reported (the five-year condition) over documented brackets: under it the code returns
		// the remainder
		const res = runThaiCorpusCase({
			income: { section40_1: 600_000 },
			separateSheet: {
				amount: 1_500_000,
				yearsOfService: 4,
				lastDailyWage: 2_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.isEligible).toBe(false)
		expect(res.breakdown.separateSheet.addedToSection40_1).toBe(1_500_000)
		expect(res.breakdown.separateSheet.tax).toBe(0)
		// 2,100,000 assessable - 100,000 - 60,000 = 1,940,000
		expect(res.breakdown.netTaxableIncome).toBe(1_940_000)
		expect(res.totalTax).toBe(thb(350_000))
	})

	it("switches to the separate sheet at exactly five years", () => {
		// documented (7,000 a year and 50%) with the derived ladder: 500,000 - 5 x 7,000 = 465,000,
		// half is 232,500, taxed at 5%
		const res = runThaiCorpusCase({
			separateSheet: {
				amount: 500_000,
				yearsOfService: 5,
				lastDailyWage: 1_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.isEligible).toBe(true)
		expect(res.breakdown.separateSheet.netTaxable).toBe(232_500)
		expect(res.breakdown.separateSheet.tax).toBe(11_625)
	})

	it("never lets the fixed expense exceed the lump sum", () => {
		// derived: 20 x 7,000 = 140,000, capped at the 100,000 remaining, so no tax
		const res = runThaiCorpusCase({
			separateSheet: {
				amount: 100_000,
				yearsOfService: 20,
				lastDailyWage: 1_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.fixedExpense).toBe(100_000)
		expect(res.breakdown.separateSheet.percentageExpense).toBe(0)
		expect(res.breakdown.separateSheet.netTaxable).toBe(0)
		expect(res.totalTax).toBe(thb(0))
	})

	it("lands exactly on the first tier of the schedule, which has no 0% band", () => {
		// derived (the ladder) over the documented 7,000/50% and the reported five-year condition:
		// 635,000 - 5 x 7,000 = 600,000, half is 300,000, the first tier's top;
		// 5% of it is 15,000 where a 0% band would have made it 7,500
		const res = runThaiCorpusCase({
			separateSheet: {
				amount: 635_000,
				yearsOfService: 5,
				lastDailyWage: 1_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.netTaxable).toBe(300_000)
		expect(res.breakdown.separateSheet.tax).toBe(15_000)
	})

	it("reaches the top of the separate schedule", () => {
		// documented (7,000/50%) with the derived ladder: 10,000,000 - 70,000 = 9,930,000, half is
		// 4,965,000;
		// 15,000 + 20,000 + 37,500 + 50,000 + 250,000 + 2,965,000 at 30% (889,500)
		const res = runThaiCorpusCase({
			separateSheet: {
				amount: 10_000_000,
				yearsOfService: 10,
				lastDailyWage: 1_000,
				paymentType: "retirement",
			},
		})
		expect(res.breakdown.separateSheet.netTaxable).toBe(4_965_000)
		expect(res.breakdown.separateSheet.tax).toBe(1_262_000)
		expect(res.totalTax).toBe(thb(1_262_000))
	})
})
