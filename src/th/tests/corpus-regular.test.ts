import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus, basis documented or derived. The arithmetic is written beside each
// expectation so a reviewer can check the case without running it. Sources are recorded in
// references/th/SOURCES.md; a figure that is unsourced there is asserted by no case.
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

	it("agrees with a 2026 published worked example: 600,000 salary and 10,500 social security", () => {
		// reported: Raidaai tax year 2569 prints 20,450 for this case
		const res = runThaiCorpusCase({
			income: { section40_1: 600_000 },
			allowances: { socialSecurity: 10_500 },
		})
		expect(res.breakdown.netTaxableIncome).toBe(429_500)
		expect(res.totalTax).toBe(thb(20_450))
	})

	it("applies the Section 42 ter royalty expense: 50% capped at 100,000", () => {
		// documented: R.D. No. 634 (B.E. 2560) s.3
		const res = runThaiCorpusCase({ income: { section40_3: 400_000 } })
		expect(res.breakdown.expenseDeductions.section40_3.allowed).toBe(100_000)
		expect(res.breakdown.netTaxableIncome).toBe(240_000)
		expect(res.totalTax).toBe(thb(4_500))
	})

	it("taxes an entertainer: 60% of the first 300,000 and 40% above it", () => {
		// documented: R.D. No. 629 (B.E. 2560) s.4(43): 180,000 + 280,000 = 460,000
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
		// documented: R.D. No. 629 (B.E. 2560) s.3
		const res = runThaiCorpusCase({ income: { section40_7: 1_000_000 } })
		expect(res.breakdown.expenseDeductions.section40_7.allowed).toBe(600_000)
		expect(res.breakdown.netTaxableIncome).toBe(340_000)
		expect(res.totalTax).toBe(thb(11_500))
	})

	it("applies the 30% building-rental expense and no standard deduction for 40(4)", () => {
		// reported: R.D. No. 11 s.5 rate for a building; the Code grants 40(4) no expense
		const res = runThaiCorpusCase({ income: { section40_5: { building: 500_000 } } })
		expect(res.breakdown.expenseDeductions.section40_5.allowed).toBe(150_000)
		expect(res.breakdown.netTaxableIncome).toBe(290_000)
		expect(res.totalTax).toBe(thb(7_000))
		const interest = runThaiCorpusCase({ income: { section40_4: 100_000 } })
		expect(interest.breakdown.expenseDeductions.section40_4.allowed).toBe(0)
	})
})
