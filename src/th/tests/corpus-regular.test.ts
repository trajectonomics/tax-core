import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for regular income and the Section 40 expense rates. Each comment names the
// basis: `documented` where the document prints the answer, `derived` where it is hand arithmetic
// over documented figures, `reported` where a secondary source states the 2026 figure. The
// arithmetic sits beside each expectation so a reviewer can check the case without running it.
describe("corpus: regular income and the Section 40 expense rates", () => {
	it("taxes a salary: 50% expense capped at 100,000, 60,000 personal allowance", () => {
		// documented: Act No. 44 (B.E. 2560) s.3 (42 bis) and s.5 (47(1)(a)); R.D. No. 470 s.4
		const res = runThaiCorpusCase({ income: { section40_1: 600_000 } })
		expect(res.breakdown.expenseDeductions.section40_1_2.allowed).toBe(100_000)
		expect(res.breakdown.allowances.personal.allowed).toBe(60_000)
		expect(res.breakdown.netTaxableIncome).toBe(440_000)
		// 150,000 at 0% + 150,000 at 5% (7,500) + 140,000 at 10% (14,000)
		expect(res.totalTax).toBe(thb(21_500))
		expect(res.marginalRate).toBe(0.1)
	})

	it("applies the Section 42 ter royalty expense: 50% capped at 100,000", () => {
		// documented: R.D. No. 634 (B.E. 2560) s.3
		const res = runThaiCorpusCase({ income: { section40_3: 400_000 } })
		expect(res.breakdown.expenseDeductions.section40_3.allowed).toBe(100_000)
		expect(res.breakdown.netTaxableIncome).toBe(240_000)
		// 150,000 at 0% + 90,000 at 5% (4,500)
		expect(res.totalTax).toBe(thb(4_500))
	})

	it("taxes an entertainer: 60% of the first 300,000 and 40% above it", () => {
		// documented: R.D. No. 629 (B.E. 2560) s.4(43): 180,000 + 280,000 = 460,000; 7,500 + 18,000
		const res = runThaiCorpusCase({ income: { section40_8: { entertainer: 1_000_000 } } })
		expect(res.breakdown.expenseDeductions.section40_8.allowed).toBe(460_000)
		expect(res.breakdown.netTaxableIncome).toBe(480_000)
		expect(res.totalTax).toBe(thb(25_500))
	})

	it("caps the entertainer expense at 600,000", () => {
		// documented: 180,000 + 680,000 = 860,000, capped at 600,000
		const res = runThaiCorpusCase({ income: { section40_8: { entertainer: 2_000_000 } } })
		expect(res.breakdown.expenseDeductions.section40_8.allowed).toBe(600_000)
		expect(res.breakdown.netTaxableIncome).toBe(1_340_000)
		// 115,000 to 1,000,000 + 340,000 at 25% (85,000)
		expect(res.totalTax).toBe(thb(200_000))
	})

	it("applies the Section 40(7) contracting expense of 60%", () => {
		// documented: R.D. No. 629 (B.E. 2560) s.3; 7,500 + 4,000
		const res = runThaiCorpusCase({ income: { section40_7: 1_000_000 } })
		expect(res.breakdown.expenseDeductions.section40_7.allowed).toBe(600_000)
		expect(res.breakdown.netTaxableIncome).toBe(340_000)
		expect(res.totalTax).toBe(thb(11_500))
	})

	it("applies the 50% salary expense below its ceiling", () => {
		// documented: 50% of 100,000 = 50,000, under the 100,000 ceiling; the 60,000
		// personal allowance then exceeds the 50,000 left, so the taxable income is 0
		const res = runThaiCorpusCase({ income: { section40_1: 100_000 } })
		expect(res.breakdown.expenseDeductions.section40_1_2.allowed).toBe(50_000)
		expect(res.breakdown.netTaxableIncome).toBe(0)
		expect(res.totalTax).toBe(thb(0))
	})

	it("applies the Section 40(8) general expense of 60%", () => {
		// documented: R.D. No. 629 (B.E. 2560) s.4; 600,000 of 1,000,000, so 340,000 taxable
		const res = runThaiCorpusCase({ income: { section40_8: 1_000_000 } })
		expect(res.breakdown.expenseDeductions.section40_8.allowed).toBe(600_000)
		expect(res.breakdown.netTaxableIncome).toBe(340_000)
		// 7,500 + 4,000
		expect(res.totalTax).toBe(thb(11_500))
	})

	it("reaches the 35% top bracket", () => {
		// documented: Act No. 44 (B.E. 2560) s.12; 6,000,000 - 100,000 - 60,000 = 5,840,000;
		// 1,265,000 to 5,000,000 + 840,000 at 35% (294,000)
		const res = runThaiCorpusCase({ income: { section40_1: 6_000_000 } })
		expect(res.breakdown.netTaxableIncome).toBe(5_840_000)
		expect(res.totalTax).toBe(thb(1_559_000))
		expect(res.marginalRate).toBe(0.35)
	})

	it("applies each Section 40(5) rental rate the overview prints", () => {
		// reported: 30% building and vehicles, 20% agricultural land, 15% other land, 10% other
		const at = (input: object): number =>
			runThaiCorpusCase({ income: { section40_5: input } }).breakdown.expenseDeductions.section40_5
				.allowed
		expect(at({ building: 500_000 })).toBe(150_000)
		expect(at({ vehicles: 500_000 })).toBe(150_000)
		expect(at({ agriculturalLand: 500_000 })).toBe(100_000)
		expect(at({ nonAgriculturalLand: 500_000 })).toBe(75_000)
		expect(at({ other: 500_000 })).toBe(50_000)
	})

	it("taxes a building rental after its 30% expense", () => {
		// reported: 500,000 - 150,000 - 60,000 = 290,000; 150,000 at 0% + 140,000 at 5%
		const res = runThaiCorpusCase({ income: { section40_5: { building: 500_000 } } })
		expect(res.breakdown.netTaxableIncome).toBe(290_000)
		expect(res.totalTax).toBe(thb(7_000))
	})

	it("applies the 60% medical and 30% other-profession expenses", () => {
		// reported: the same overview prints 60% for medicine and 30% otherwise
		const medical = runThaiCorpusCase({ income: { section40_6: { medical: 1_000_000 } } })
		expect(medical.breakdown.expenseDeductions.section40_6.allowed).toBe(600_000)
		expect(medical.breakdown.netTaxableIncome).toBe(340_000)
		// 7,500 + 4,000
		expect(medical.totalTax).toBe(thb(11_500))
		const other = runThaiCorpusCase({ income: { section40_6: { other: 500_000 } } })
		expect(other.breakdown.expenseDeductions.section40_6.allowed).toBe(150_000)
	})

	it("grants no standard deduction on Section 40(4) income", () => {
		// derived: the Code's expense sections name only 40(1)-(3) and 40(5)-(8)
		const res = runThaiCorpusCase({ income: { section40_4: 100_000 } })
		expect(res.breakdown.expenseDeductions.section40_4.allowed).toBe(0)
		expect(res.breakdown.netTaxableIncome).toBe(40_000)
		expect(res.totalTax).toBe(thb(0))
	})
})
