import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus that exercises several regimes in one return, as AGENTS.md rule 10 asks:
// regular income, a separate sheet, a dividend credit, final withholding and withholding already
// paid. Every component is asserted on its own before the combined liability.
describe("corpus: one return combining every regime", () => {
	it("adds the regular tax, the separate sheet, real estate, final withholding and a credit", () => {
		// basis: documented (Sections 42 bis, 47, 48(3), 48(4)(a), 48(5), 47 bis) and derived (the
		// no-0% ladders); the corporate rate and the withheld amount are the filer's inputs.
		// regular: 600,000 salary + 80,000 dividend grossed to 100,000 = 700,000 assessable;
		// less 100,000 expense, 60,000 personal and 9,000 social security leaves 531,000;
		// 7,500 + 20,000 + 31,000 at 15% (4,650) = 32,150
		// separate sheet: 1,500,000 - 140,000 = 1,360,000, half is 680,000, taxed 62,000
		// real estate: 2,000,000 - 1,000,000 = 1,000,000 over 5 years, 50,000
		// final withholding: 100,000 interest at 15% = 15,000, outside the brackets
		// credit: 80,000 x 0.2 / 0.8 = 20,000
		const res = runThaiCorpusCase({
			income: {
				section40_1: 600_000,
				section40_4: {
					interest: { amount: 100_000, election: "final" },
					dividends: { amount: 80_000, corpTaxRate: 0.2 },
				},
			},
			allowances: { socialSecurity: 9_000 },
			separateSheet: {
				amount: 1_500_000,
				yearsOfService: 20,
				lastDailyWage: 2_000,
				paymentType: "retirement",
			},
			realEstateTransfer: {
				grossTransferValue: 2_000_000,
				holdingYears: 5,
				acquisitionType: "inheritance_or_gift",
			},
			withholdingTax: 5_000,
		})
		const breakdown = res.breakdown
		expect(breakdown.assessableIncome.total).toBe(700_000)
		expect(breakdown.netTaxableIncome).toBe(531_000)
		expect(breakdown.regularTax).toBe(32_150)
		expect(breakdown.separateSheet.tax).toBe(62_000)
		expect(breakdown.realEstate.tax).toBe(50_000)
		expect(breakdown.finalWithholding.totalTax).toBe(15_000)
		expect(breakdown.dividendTaxCredit.credit).toBe(20_000)
		// 32,150 + 62,000 + 50,000 + 15,000
		expect(breakdown.totalCombinedTax).toBe(159_150)
		expect(res.totalTax).toBe(thb(159_150))
		// 159,150 - 15,000 final - 20,000 credit - 5,000 withheld
		expect(breakdown.netTaxPayable).toBe(119_150)
		// 600,000 salary + 100,000 final interest + 100,000 grossed dividend + 1,500,000
		// separate sheet + 2,000,000 real estate
		expect(res.grossIncome).toBe(thb(4_300_000))
	})
})
