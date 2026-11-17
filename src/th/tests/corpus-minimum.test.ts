import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 48(2) minimum gross tax: 0.5% of non-employment income from
// 120,000, payable only above 5,000 and only above the progressive tax.
describe("corpus: the Section 48(2) minimum gross tax", () => {
	it("does not apply when 0.5% of the income is under 5,000", () => {
		// documented: 200,000 business income at 60% expense, 60,000 personal;
		// 0.5% of 200,000 = 1,000, exempt under R.D. No. 480 s.3
		const res = runThaiCorpusCase({ income: { section40_8: 200_000 } })
		expect(res.breakdown.minimumGrossTax.calculatedTax).toBe(1_000)
		expect(res.breakdown.minimumGrossTax.isApplicable).toBe(false)
		expect(res.totalTax).toBe(thb(0))
	})

	it("applies the floor when its 0.5% exceeds both 5,000 and the progressive tax", () => {
		// documented: 2,000,000 gross, 1,800,000 actual expense, 60,000 personal;
		// 0.5% of 2,000,000 = 10,000, progressive tax 0
		const res = runThaiCorpusCase({
			income: {
				section40_8: { amount: 2_000_000, expenseElection: "actual", actualExpense: 1_800_000 },
			},
		})
		expect(res.breakdown.minimumGrossTax.calculatedTax).toBe(10_000)
		expect(res.breakdown.minimumGrossTax.wasApplied).toBe(true)
		expect(res.breakdown.regularTax).toBe(10_000)
		expect(res.totalTax).toBe(thb(10_000))
	})

	it("excludes employment income from the floor", () => {
		// documented: Section 48(2), second paragraph; 2,000,000 salary only
		const res = runThaiCorpusCase({ income: { section40_1: 2_000_000 } })
		expect(res.breakdown.minimumGrossTax.grossEligibleIncome).toBe(0)
		expect(res.breakdown.minimumGrossTax.isApplicable).toBe(false)
		expect(res.totalTax).toBe(thb(325_000))
	})

	it("yields to a larger progressive tax", () => {
		// documented: 1,000,000 gross at 200,000 actual expense, 60,000 personal;
		// 0.5% = 5,000 is not above the 5,000 threshold, progressive 63,500 stands
		const res = runThaiCorpusCase({
			income: {
				section40_8: { amount: 1_000_000, expenseElection: "actual", actualExpense: 200_000 },
			},
		})
		expect(res.breakdown.minimumGrossTax.calculatedTax).toBe(5_000)
		expect(res.breakdown.minimumGrossTax.wasApplied).toBe(false)
		expect(res.breakdown.netTaxableIncome).toBe(740_000)
		expect(res.totalTax).toBe(thb(63_500))
	})
})
