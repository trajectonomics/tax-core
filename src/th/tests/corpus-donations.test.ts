import { describe, expect, it } from "bun:test"
import { thb } from "../../core/money"
import { runThaiCorpusCase } from "./corpus-harness"

// Transcribed corpus for the Section 47(7) donation allowances. Net before donations is
// 1,000,000 - 100,000 expense - 60,000 personal = 840,000 in every case below.
describe("corpus: the Section 47(7) donation allowances", () => {
	it("allows a general donation up to 10% of the net before donations", () => {
		// documented: Section 47(7); 50,000 is under the 84,000 cap
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { donation1x: 50_000 },
		})
		expect(res.breakdown.allowances.donations.donation1x.allowed).toBe(50_000)
		expect(res.breakdown.netTaxableIncome).toBe(790_000)
		expect(res.totalTax).toBe(thb(73_000))
	})

	it("clamps a general donation at 10% of the net before donations", () => {
		// documented: 200,000 requested, 84,000 allowed
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { donation1x: 200_000 },
		})
		expect(res.breakdown.allowances.donations.donation1x.allowed).toBe(84_000)
		expect(res.breakdown.netTaxableIncome).toBe(756_000)
		expect(res.totalTax).toBe(thb(66_200))
	})

	it("doubles a qualifying donation before applying the 10% cap", () => {
		// reported: 30,000 donated at 2x = 60,000, under the 84,000 cap
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { donation2x: 30_000 },
		})
		expect(res.breakdown.allowances.donations.donation2x.allowed).toBe(60_000)
		expect(res.breakdown.netTaxableIncome).toBe(780_000)
		expect(res.totalTax).toBe(thb(71_000))
	})

	it("takes the 2x donation before the 1x donation, each on the remaining net", () => {
		// reported (the 2x multiplier) and documented (the 10% cap): 2x 50,000 doubled to 100,000,
		// capped at 84,000 leaves 756,000;
		// 1x 100,000 capped at 75,600 of that; taxable 680,400
		const res = runThaiCorpusCase({
			income: { section40_1: 1_000_000 },
			allowances: { donation2x: 50_000, donation1x: 100_000 },
		})
		expect(res.breakdown.allowances.donations.donation2x.allowed).toBe(84_000)
		expect(res.breakdown.allowances.donations.donation1x.allowed).toBe(75_600)
		expect(res.breakdown.allowances.donations.total).toBe(159_600)
		expect(res.breakdown.netTaxableIncome).toBe(680_400)
		// 7,500 + 20,000 + 180,400 at 15% (27,060)
		expect(res.totalTax).toBe(thb(54_560))
	})
})
