import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 47(1) family allowances. Sources are recorded in
// references/th/SOURCES.md; every case is documented there, not computed by the package.
describe("corpus: personal, spouse, child, parent and disabled allowances", () => {
	it("adds the 60,000 spouse allowance to the 60,000 personal allowance", () => {
		// documented: Act No. 44 (B.E. 2560) s.5 (47(1)(a), (b)) and s.7 (47(2))
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			filingStatus: "married_no_income_spouse",
		})
		expect(res.breakdown.allowances.spouse.allowed).toBe(60_000)
		// 1,000,000 - 100,000 - 120,000 = 780,000; 7,500 + 20,000 + 37,500 + 6,000
		expect(res.breakdown.netTaxableIncome).toBe(780_000)
		expect(res.totalTax).toBe(thb(71_000))
	})

	it("pays the second-child bonus only for a child born in or after 2018", () => {
		// documented: Act No. 46 (B.E. 2561) s.3: 2 x 30,000 + one 30,000 bonus
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { children: [{ birthYear: 2015 }, { birthYear: 2019 }] },
		})
		expect(res.breakdown.allowances.children.allowed).toBe(90_000)
		expect(res.breakdown.netTaxableIncome).toBe(750_000)
		expect(res.totalTax).toBe(thb(65_000))
	})

	it("gives the same child bonus whatever order the children arrive in", () => {
		// documented: Act No. 46 (B.E. 2561) s.3; ADR 0003 rule 4 sorts by birth year first
		const children = [{ birthYear: 2019 }, { birthYear: 2015 }]
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { children },
		})
		expect(res.breakdown.allowances.children.allowed).toBe(90_000)
	})

	it("allows both spouses' parents and caps them at four people", () => {
		// documented: Section 47(1)(j); derived: the Code names four parents in total
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			filingStatus: "married_no_income_spouse",
			allowances: {
				parents: {
					taxpayerFather: true,
					taxpayerMother: true,
					spouseFather: true,
					spouseMother: true,
				},
			},
		})
		expect(res.breakdown.allowances.parents.allowed).toBe(120_000)
		expect(res.breakdown.netTaxableIncome).toBe(660_000)
		expect(res.totalTax).toBe(thb(51_500))
	})

	it("caps a parent count above four at 120,000", () => {
		// derived: 4 x 30,000 is the statutory maximum (47(1)(j))
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { parents: 5 },
		})
		expect(res.breakdown.allowances.parents.allowed).toBe(120_000)
	})

	it("caps the social-security contribution at 10,500", () => {
		// reported: 875 baht a month for 12 months; 1,000,000 - 100,000 - 70,500 = 829,500
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { socialSecurity: 12_000 },
		})
		expect(res.breakdown.allowances.socialSecurity.allowed).toBe(10_500)
		expect(res.breakdown.netTaxableIncome).toBe(829_500)
		// 65,000 to 750,000 + 79,500 at 20% (15,900)
		expect(res.totalTax).toBe(thb(80_900))
	})

	it("allows 60,000 for each disabled person cared for", () => {
		// documented: Section 47(1)(k), as amended by Act No. 37 (B.E. 2552)
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { disabledCareCount: 2 },
		})
		expect(res.breakdown.allowances.disabled.allowed).toBe(120_000)
		expect(res.breakdown.netTaxableIncome).toBe(720_000)
		expect(res.totalTax).toBe(thb(60_500))
	})
})
