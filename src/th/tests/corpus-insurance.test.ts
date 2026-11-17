import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the insurance, mortgage and social-security allowances. The 2026 caps
// rest on a secondary source (reported in references/th/SOURCES.md), because M.R. No. 126 clause
// 2(61) is served only as an image scan.
describe("corpus: insurance, mortgage interest and social security", () => {
	it("combines life and health premiums under the 100,000 ceiling", () => {
		// reported: life 60,000 + health 30,000, health capped at 25,000, combined at 100,000
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { lifeInsurance: 60_000, healthInsurance: 30_000 },
		})
		expect(res.breakdown.allowances.lifeInsurance.allowed).toBe(85_000)
		expect(res.breakdown.netTaxableIncome).toBe(755_000)
		expect(res.totalTax).toBe(thb(66_000))
	})

	it("clamps life plus health at 100,000 when the pair exceeds it", () => {
		// reported: 90,000 + 25,000 = 115,000 requested, 100,000 allowed
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { lifeInsurance: 90_000, healthInsurance: 25_000 },
		})
		expect(res.breakdown.allowances.lifeInsurance.allowed).toBe(100_000)
		expect(res.breakdown.allowances.lifeInsurance.wasClamped).toBe(true)
	})

	it("caps a parent's health-insurance premium at 15,000", () => {
		// reported: 15,000 for all parents together
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { parentHealthInsurance: 20_000 },
		})
		expect(res.breakdown.allowances.parentHealthInsurance.allowed).toBe(15_000)
		expect(res.totalTax).toBe(thb(80_000))
	})

	it("caps a spouse's life-insurance premium at 10,000", () => {
		// documented: Section 47(1)(d), second paragraph
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			filingStatus: "married_no_income_spouse",
			allowances: { spouseLifeInsurance: 12_000 },
		})
		expect(res.breakdown.allowances.spouseLifeInsurance.allowed).toBe(10_000)
		expect(res.breakdown.allowances.spouseLifeInsurance.wasClamped).toBe(true)
	})

	it("caps mortgage interest at 100,000", () => {
		// reported: amount paid, not exceeding 100,000
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { mortgageInterest: 150_000 },
		})
		expect(res.breakdown.allowances.mortgageInterest.allowed).toBe(100_000)
		expect(res.breakdown.netTaxableIncome).toBe(740_000)
		expect(res.totalTax).toBe(thb(63_500))
	})

	it("caps a social-security contribution at 10,500", () => {
		// reported: 875 baht a month for 12 months
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { socialSecurity: 12_000 },
		})
		expect(res.breakdown.allowances.socialSecurity.allowed).toBe(10_500)
		expect(res.breakdown.allowances.socialSecurity.wasClamped).toBe(true)
	})
})
