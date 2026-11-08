import { describe, expect, it } from "bun:test"
import { addMinimumGrossTax, addProgressiveTax, addRegularTax } from "../levy/brackets"
import { ThLevyGraph } from "../levy/graph"
import { TH_2026_PARAMETERS } from "../parameters"
import { evaluateThBracketSet } from "../stages/bracket-eval"
import { calculateMinimumGrossTax } from "../stages/minimum-tax"
import { toSatang } from "../units"
import { measureOf, measureValue } from "./levy-build"

const bracketBoundaries = [
	0, 149_999.99, 150_000, 150_000.01, 300_000, 500_000, 750_000, 1_000_000, 2_000_000, 5_000_000,
	10_000_000,
]

describe("TH 2026 Levy bracket measures", () => {
	it("matches the calculator stage at and around every bracket boundary", () => {
		for (const taxable of bracketBoundaries) {
			const expected = evaluateThBracketSet(taxable, taxable, TH_2026_PARAMETERS.brackets).totalTax
			expect(measureOf((graph, id) => addProgressiveTax(graph, id), taxable)).toBe(
				toSatang(expected),
			)
		}
	})

	it("computes a hand-worked 5,000,000 THB schedule", () => {
		expect(measureOf((graph, id) => addProgressiveTax(graph, id), 5_000_000)).toBe(
			toSatang(1_265_000),
		)
	})

	it("rounds a half-satang slice up (5% of 10 satang)", () => {
		expect(measureOf((graph, id) => addProgressiveTax(graph, id), 150_000.1)).toBe(1)
	})

	it("matches the minimum gross tax stage below, at, and above both thresholds", () => {
		for (const gross of [119_999.99, 120_000, 120_000.01, 120_001, 1_000_000, 1_000_001]) {
			const expected = calculateMinimumGrossTax(gross, 0)
			const result = minimum(gross)
			expect({ gross, calculated: result.calculated }).toEqual({
				gross,
				calculated: toSatang(expected.calculatedTax),
			})
		}
	})

	it("applies the minimum tax only above 5,000 THB and above progressive tax", () => {
		expect(minimumOf(1_000_000, 0).regular).toBe(0)
		expect(minimumOf(1_000_001, 400_000).regular).toBe(500_001)
		expect(minimumOf(1_000_001, 600_000).regular).toBe(600_000)
	})
})

function minimumOf(gross: number, progressive: number): { calculated: number; regular: number } {
	const graph = new ThLevyGraph()
	const grossId = graph.constant(toSatang(gross))
	const progressiveId = graph.constant(progressive)
	const measures = addMinimumGrossTax(graph, grossId)
	const regular = addRegularTax(graph, progressiveId, measures.applicable)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, regular)
	return {
		calculated: measureValue(levy, measures.calculated),
		regular: measureValue(levy, regular),
	}
}

function minimum(gross: number): { calculated: number; regular: number } {
	return minimumOf(gross, 0)
}
