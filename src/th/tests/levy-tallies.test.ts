import { describe, expect, it } from "bun:test"
import { ThLevyGraph } from "../levy/graph"
import { ThLevyTallyBasis } from "../levy/graph-types"
import {
	TH_LEVY_CONTRIBUTION_LABELS,
	TH_LEVY_INCOME_LABELS,
	ThLevyContributionLabel,
	ThLevyIncomeLabel,
} from "../levy/labels"
import { addThLevyTallies } from "../levy/tallies"

describe("TH 2026 Levy tally labels", () => {
	it("documents one income label per Section 40 class and Section 40(4) source", () => {
		expect(Object.values(ThLevyIncomeLabel)).toHaveLength(22)
		expect(new Set(Object.values(ThLevyIncomeLabel)).size).toBe(22)
		expect(TH_LEVY_INCOME_LABELS).toHaveLength(22)
		expect(TH_LEVY_INCOME_LABELS[0]).toBe(ThLevyIncomeLabel.Section40_1)
		expect(TH_LEVY_INCOME_LABELS).toContain(ThLevyIncomeLabel.Section40_8Entertainer)
	})

	it("documents one contribution label per contribution-driven allowance", () => {
		expect(Object.values(ThLevyContributionLabel)).toEqual([
			ThLevyContributionLabel.Rmf,
			ThLevyContributionLabel.Ssf,
			ThLevyContributionLabel.Pvd,
			ThLevyContributionLabel.Gpf,
			ThLevyContributionLabel.Nsf,
			ThLevyContributionLabel.PensionLifeInsurance,
			ThLevyContributionLabel.ThaiEsg,
		])
		expect(TH_LEVY_CONTRIBUTION_LABELS).toHaveLength(7)
	})

	it("emits a gross tally per income label and a funded tally per contribution label", () => {
		const graph = new ThLevyGraph()
		const tallies = addThLevyTallies(graph)
		const levy = graph.build(
			"t",
			{ month: 1, day: 1 },
			{ month: 3, day: 31 },
			tallies.income[ThLevyIncomeLabel.Section40_1],
		)
		const byId = new Map(levy.measures.map((measure) => [measure.id, measure]))
		for (const label of TH_LEVY_INCOME_LABELS) {
			expect(byId.get(tallies.income[label])).toEqual({
				id: tallies.income[label],
				op: "tally",
				label,
				basis: ThLevyTallyBasis.Gross,
			})
		}
		for (const label of TH_LEVY_CONTRIBUTION_LABELS) {
			expect(byId.get(tallies.contributions[label])).toEqual({
				id: tallies.contributions[label],
				op: "tally",
				label,
				basis: ThLevyTallyBasis.Funded,
			})
		}
		expect(levy.measures).toHaveLength(29)
	})
})
