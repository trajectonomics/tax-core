import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 48(3) final withholding elections and the Section 47 bis
// dividend tax credit. The digital-asset rate is unsourced, so no case asserts it.
describe("corpus: final withholding and the dividend tax credit", () => {
	it("withholds 15% on final-elected interest and keeps it out of the brackets", () => {
		// documented: Section 48(3)(a) 15%; salary 600,000 taxes 21,500 as in corpus-regular
		const res = runThaiCorpusCase({
			income: {
				section40_1: 600_000,
				section40_4: { interest: { amount: 100_000, election: "final" } },
			},
		})
		expect(res.breakdown.assessableIncome.section40_4).toBe(0)
		expect(res.breakdown.finalWithholding.interest.tax).toBe(15_000)
		expect(res.totalTax).toBe(thb(36_500))
		expect(res.netTaxPayable).toBe(thb(21_500))
	})

	it("withholds 10% on final-elected dividends and gives no credit", () => {
		// documented: Section 48(3), resident shareholder election
		const res = runThaiCorpusCase({
			income: {
				section40_4: { dividends: { amount: 100_000, election: "final", corpTaxRate: 0.2 } },
			},
		})
		expect(res.breakdown.finalWithholding.dividends.tax).toBe(10_000)
		expect(res.breakdown.dividendTaxCredit.credit).toBe(0)
		expect(res.totalTax).toBe(thb(10_000))
		expect(res.netTaxPayable).toBe(thb(0))
	})

	it("taxes the same interest in the brackets when it is not elected final", () => {
		// documented: Section 48(3) is an election; 700,000 - 100,000 - 60,000 = 540,000;
		// 7,500 + 20,000 + 40,000 at 15% (6,000)
		const res = runThaiCorpusCase({
			income: { section40_1: 600_000, section40_4: { interest: { amount: 100_000 } } },
		})
		expect(res.breakdown.assessableIncome.section40_4).toBe(100_000)
		expect(res.breakdown.finalWithholding.totalTax).toBe(0)
		expect(res.breakdown.netTaxableIncome).toBe(540_000)
		expect(res.totalTax).toBe(thb(33_500))
	})

	it("grosses an included dividend up by 3/7 of itself at a 20% corporate rate", () => {
		// documented: Section 47 bis: 100,000 x 0.2 / 0.8 = 25,000 credit; 125,000 assessable;
		// less 60,000 personal leaves 65,000, tax 0, so the credit is refunded
		const res = runThaiCorpusCase({
			income: { section40_4: { dividends: { amount: 100_000, corpTaxRate: 0.2 } } },
		})
		expect(res.breakdown.dividendTaxCredit.credit).toBe(25_000)
		expect(res.breakdown.dividendTaxCredit.grossedUpAmount).toBe(125_000)
		expect(res.breakdown.netTaxableIncome).toBe(65_000)
		expect(res.totalTax).toBe(thb(0))
		expect(res.netTaxPayable).toBe(thb(-25_000, "refund", { allowNegative: true }))
	})

	it("credits a dividend against salary tax", () => {
		// documented: 600,000 + 200,000 grossed to 250,000 = 850,000 assessable;
		// less 100,000 expense and 60,000 personal leaves 690,000; tax 56,000, credit 50,000
		const res = runThaiCorpusCase({
			income: {
				section40_1: 600_000,
				section40_4: { dividends: { amount: 200_000, corpTaxRate: 0.2 } },
			},
		})
		expect(res.breakdown.netTaxableIncome).toBe(690_000)
		expect(res.totalTax).toBe(thb(56_000))
		expect(res.breakdown.dividendTaxCredit.credit).toBe(50_000)
		expect(res.netTaxPayable).toBe(thb(6_000))
	})
})
