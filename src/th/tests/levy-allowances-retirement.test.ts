import { describe, expect, it } from "bun:test"
import { addRetirementAllowances } from "../levy/allowances-retirement"
import { addAssessableMeasures } from "../levy/assessable"
import { ThLevyContributionLabel, ThLevyIncomeLabel } from "../levy/labels"
import { ThLevyMeasureId } from "../levy/measure-ids"
import type { ThLevyProfile } from "../levy/profile-types"
import { addSection40_4 } from "../levy/regimes"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const S1 = ThLevyIncomeLabel.Section40_1

function retirement(
	income: ReadonlyMap<string, number>,
	contributions: ReadonlyMap<string, number>,
): { cluster: number; thaiEsg: number } {
	const values = runLevy(income, contributions, (graph, tallies) => {
		const section40_4 = addSection40_4(graph, tallies)
		const assessable = addAssessableMeasures(graph, tallies, section40_4)
		return addRetirementAllowances(graph, tallies, assessable.total).cluster
	}).values
	return {
		cluster: values.get(ThLevyMeasureId.RetirementCluster) ?? Number.NaN,
		thaiEsg: values.get(ThLevyMeasureId.ThaiEsg) ?? Number.NaN,
	}
}

function expected(
	profile: ThLevyProfile,
	income: ReadonlyMap<string, number>,
	contributions: ReadonlyMap<string, number>,
) {
	const allowance = breakdownOf(profile, income, contributions).allowances
	return {
		cluster: satangOf(allowance.retirementCluster.combined.allowed),
		thaiEsg: satangOf(allowance.thaiEsg.allowed),
	}
}

describe("TH 2026 Levy retirement allowances", () => {
	it("caps every fund by its percentage and ceiling, then by the 500,000 cluster", () => {
		const income = new Map([[S1, toSatang(1_000_000)]])
		const contributions = new Map([
			[ThLevyContributionLabel.Rmf, toSatang(400_000)],
			[ThLevyContributionLabel.Ssf, toSatang(300_000)],
			[ThLevyContributionLabel.Pvd, toSatang(500_000)],
			[ThLevyContributionLabel.Gpf, toSatang(500_000)],
			[ThLevyContributionLabel.Nsf, toSatang(30_000)],
			[ThLevyContributionLabel.PensionLifeInsurance, toSatang(200_000)],
			[ThLevyContributionLabel.ThaiEsg, toSatang(400_000)],
		])
		expect(retirement(income, contributions)).toEqual({
			cluster: toSatang(500_000),
			thaiEsg: toSatang(300_000),
		})
		expect(retirement(income, contributions)).toEqual(expected({}, income, contributions))
	})

	it("uses the Section 40(1) wage for PVD and GPF percentage caps", () => {
		const income = new Map([[S1, toSatang(300_000)]])
		const contributions = new Map([
			[ThLevyContributionLabel.Pvd, toSatang(100_000)],
			[ThLevyContributionLabel.Gpf, toSatang(100_000)],
		])
		expect(retirement(income, contributions)).toEqual({ cluster: toSatang(135_000), thaiEsg: 0 })
		expect(retirement(income, contributions)).toEqual(expected({}, income, contributions))
	})

	it("clamps a National Savings Fund contribution at its flat ceiling", () => {
		const income = new Map([[S1, toSatang(100_000)]])
		const contributions = new Map([[ThLevyContributionLabel.Nsf, toSatang(40_000)]])
		expect(retirement(income, contributions)).toEqual({ cluster: toSatang(30_000), thaiEsg: 0 })
		expect(retirement(income, contributions)).toEqual(expected({}, income, contributions))
	})
})
