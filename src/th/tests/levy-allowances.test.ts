import { describe, expect, it } from "bun:test"
import { calculateThTax } from "../calculate"
import { addAllowanceMeasures } from "../levy/allowances"
import { addAssessableMeasures } from "../levy/assessable"
import { addExpenseMeasures } from "../levy/expenses"
import { ThLevyGraph } from "../levy/graph"
import { ThLevyContributionLabel, ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyProfile } from "../levy/profile-types"
import { addSection40_4 } from "../levy/regimes"
import { addThLevyTallies } from "../levy/tallies"
import type { ThFilingStatus } from "../types"
import { toSatang } from "../units"
import { thTaxInputFor } from "./levy-input"
import { satangOf } from "./levy-satang"
import { levyValues, simTallies } from "./levy-sim"

type Totals = ReadonlyMap<string, number>

function run(profile: ThLevyProfile, income: Totals, contributions: Totals = new Map()) {
	const graph = new ThLevyGraph()
	const tallies = addThLevyTallies(graph)
	const section40_4 = addSection40_4(graph, tallies, profile.section40_4)
	const assessable = addAssessableMeasures(graph, tallies, section40_4)
	const expenses = addExpenseMeasures(graph, tallies, profile.expenses)
	const measures = addAllowanceMeasures(graph, tallies, profile, assessable.total, expenses)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, measures.netTaxable)
	const values = levyValues(levy, simTallies(income, contributions))
	return {
		total: values.get(measures.total) ?? Number.NaN,
		netTaxable: values.get(measures.netTaxable) ?? Number.NaN,
	}
}

function calculator(profile: ThLevyProfile, income: Totals, contributions: Totals = new Map()) {
	const breakdown = calculateThTax(thTaxInputFor(profile, income, contributions)).breakdown
	return {
		total: satangOf(breakdown.allowances.total),
		netTaxable: satangOf(breakdown.netTaxableIncome),
	}
}

const salary = ThLevyIncomeLabel.Section40_1
const statuses: readonly ThFilingStatus[] = [
	"single",
	"married_no_income_spouse",
	"married_separate",
	"married_joint",
	"married_separate_40_1_joint_rest",
]

describe("TH 2026 Levy allowance measures", () => {
	it("bakes the personal allowance and standard expense into net taxable income", () => {
		const income = new Map([[salary, toSatang(600_000)]])
		const result = run({}, income)
		expect(result.total).toBe(toSatang(60_000))
		expect(result.netTaxable).toBe(toSatang(440_000))
		expect(result).toEqual(calculator({}, income))
	})

	it("matches the calculator across filing statuses and family allowances", () => {
		const income = new Map([[salary, toSatang(1_200_000)]])
		const profiles: ThLevyProfile[] = statuses.map((filingStatus) => ({
			filingStatus,
			allowances: {
				children: [{ birthYear: 2020 }, { birthYear: 2015 }],
				parents: { taxpayerFather: true, taxpayerMother: true, spouseFather: true },
				disabledCareCount: 1,
			},
		}))
		for (const profile of profiles) {
			expect(run(profile, income)).toEqual(calculator(profile, income))
		}
	})

	it("caps insurance, social security, and housing allowances at their ceilings", () => {
		const income = new Map([[salary, toSatang(3_000_000)]])
		const profile: ThLevyProfile = {
			filingStatus: "married_no_income_spouse",
			allowances: {
				socialSecurity: 12_000,
				lifeInsurance: 90_000,
				healthInsurance: 30_000,
				parentHealthInsurance: 20_000,
				spouseLifeInsurance: 15_000,
				mortgageInterest: 150_000,
			},
		}
		expect(run(profile, income)).toEqual(calculator(profile, income))
		expect(run(profile, income).total).toBe(
			toSatang(60_000 + 60_000 + 10_500 + 100_000 + 15_000 + 10_000 + 100_000),
		)
	})

	it("caps the retirement cluster and ThaiESG against percentage-of-income limits", () => {
		const income = new Map([[salary, toSatang(1_000_000)]])
		const contributions = new Map([
			[ThLevyContributionLabel.Rmf, toSatang(400_000)],
			[ThLevyContributionLabel.Ssf, toSatang(300_000)],
			[ThLevyContributionLabel.Pvd, toSatang(500_000)],
			[ThLevyContributionLabel.Gpf, toSatang(500_000)],
			[ThLevyContributionLabel.Nsf, toSatang(30_000)],
			[ThLevyContributionLabel.PensionLifeInsurance, toSatang(200_000)],
			[ThLevyContributionLabel.ThaiEsg, toSatang(400_000)],
		])
		const result = run({}, income, contributions)
		expect(result.total).toBe(toSatang(60_000 + 500_000 + 300_000))
		expect(result).toEqual(calculator({}, income, contributions))
	})

	it("applies the 2x then 1x donation percentage caps to net income before donations", () => {
		const income = new Map([[salary, toSatang(1_000_000)]])
		const profile: ThLevyProfile = { allowances: { donation2x: 50_000, donation1x: 100_000 } }
		const result = run(profile, income)
		expect(result.total).toBe(toSatang(60_000 + 84_000 + 75_600))
		expect(result.netTaxable).toBe(toSatang(680_400))
		expect(result).toEqual(calculator(profile, income))
	})

	it("keeps net taxable income at zero when allowances exceed assessable income", () => {
		const income = new Map([[salary, toSatang(80_000)]])
		const profile: ThLevyProfile = { allowances: { donation1x: 50_000 } }
		expect(run(profile, income).netTaxable).toBe(0)
		expect(run(profile, income)).toEqual(calculator(profile, income))
	})
})
