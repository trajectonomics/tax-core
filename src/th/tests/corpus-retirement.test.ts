import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the retirement cluster and Thai ESG. Every 2026 rate and ceiling here is
// reported from a secondary source (references/th/SOURCES.md), so each case states its basis.
describe("corpus: the retirement cluster and Thai ESG", () => {
	it("allows 30% of assessable income into RMF, under the 500,000 ceiling", () => {
		// reported: 30% of 1,000,000 = 300,000; 1,000,000 - 100,000 - 360,000 = 540,000
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { rmf: 300_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.rmf.allowed).toBe(300_000)
		expect(res.breakdown.netTaxableIncome).toBe(540_000)
		// 7,500 + 20,000 + 40,000 at 15% (6,000)
		expect(res.totalTax).toBe(thb(33_500))
	})

	it("clamps RMF at its own 500,000 ceiling", () => {
		// reported: 30% of 2,000,000 = 600,000, capped at 500,000
		const res = runThaiCorpusCase({
			income: { section40_1: 2_000_000 },
			allowances: { rmf: 700_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.rmf.allowed).toBe(500_000)
		expect(res.breakdown.allowances.retirementCluster.combined.allowed).toBe(500_000)
	})

	it("applies the 500,000 cluster ceiling across RMF, SSF and PVD together", () => {
		// reported: rmf 500,000 + ssf 200,000 + pvd 500,000 = 1,200,000, capped at 500,000
		const res = runThaiCorpusCase({
			income: { section40_1: 4_000_000 },
			allowances: { rmf: 500_000, ssf: 200_000, pvd: 500_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.combined.allowed).toBe(500_000)
		expect(res.breakdown.allowances.retirementCluster.combined.wasClamped).toBe(true)
		// 4,000,000 - 100,000 - 60,000 - 500,000 = 3,340,000
		expect(res.breakdown.netTaxableIncome).toBe(3_340_000)
		expect(res.totalTax).toBe(thb(767_000))
	})

	it("allows Thai ESG at 30% of income, capped at 300,000 and outside the cluster", () => {
		// reported: 30% of 2,000,000 = 600,000, capped at 300,000
		const res = runThaiCorpusCase({
			income: { section40_1: 2_000_000 },
			allowances: { thaiEsg: 700_000 },
		})
		expect(res.breakdown.allowances.thaiEsg.allowed).toBe(300_000)
		expect(res.breakdown.allowances.retirementCluster.combined.allowed).toBe(0)
		expect(res.totalTax).toBe(thb(250_000))
	})

	it("caps the government pension fund at 500,000 whatever rate applies", () => {
		// reported: the ceiling binds at 30% of 4,000,000 (1,200,000) and would also bind at
		// the 15% the same source prints (600,000), so the case stops at the ceiling and
		// asserts no rate — the manifest records the rate disagreement (OD5)
		const res = runThaiCorpusCase({
			income: { section40_1: 4_000_000 },
			allowances: { gpf: 1_000_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.gpf.allowed).toBe(500_000)
		expect(res.breakdown.allowances.retirementCluster.combined.allowed).toBe(500_000)
		// 4,000,000 - 100,000 - 60,000 - 500,000 = 3,340,000;
		// 365,000 to 2,000,000 + 1,340,000 at 30% (402,000)
		expect(res.breakdown.netTaxableIncome).toBe(3_340_000)
		expect(res.totalTax).toBe(thb(767_000))
	})

	it("caps the National Savings Fund contribution at 30,000", () => {
		// reported: nsf 40,000 requested, 30,000 allowed
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { nsf: 40_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.nsf.allowed).toBe(30_000)
		expect(res.totalTax).toBe(thb(77_000))
	})

	it("allows 15% of income up to 200,000 for pension life insurance", () => {
		// reported: 15% of 1,000,000 = 150,000, under the 200,000 ceiling
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { pensionLifeInsurance: 300_000 },
		})
		expect(res.breakdown.allowances.retirementCluster.pensionLifeInsurance.allowed).toBe(150_000)
		expect(res.totalTax).toBe(thb(56_000))
	})
})
