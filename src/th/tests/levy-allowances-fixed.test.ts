import { describe, expect, it } from "bun:test"
import { addFixedAllowances } from "../levy/allowances-fixed"
import type { ThLevyAllowances, ThLevyProfile } from "../levy/profile-types"
import type { ThFilingStatus } from "../types"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

function fixed(allowances: ThLevyAllowances | undefined, status: ThFilingStatus): number {
	return runLevy(new Map(), new Map(), (graph) => addFixedAllowances(graph, allowances, status)).due
}

function expectedFixed(profile: ThLevyProfile): number {
	const allowance = breakdownOf(profile, new Map()).allowances
	const parts = [
		allowance.personal.allowed,
		allowance.spouse.allowed,
		allowance.children.allowed,
		allowance.parents.allowed,
		allowance.disabled.allowed,
		allowance.socialSecurity.allowed,
		allowance.lifeInsurance.allowed,
		allowance.parentHealthInsurance.allowed,
		allowance.spouseLifeInsurance.allowed,
		allowance.mortgageInterest.allowed,
	]
	return parts.reduce((sum, value) => sum + satangOf(value), 0)
}

describe("TH 2026 Levy fixed allowances", () => {
	it("bakes the 60,000 THB personal allowance by default", () => {
		expect(fixed(undefined, "single")).toBe(60_000 * 100)
	})

	it("matches the calculator for every filing status and family shape", () => {
		const statuses: readonly ThFilingStatus[] = [
			"single",
			"married_no_income_spouse",
			"married_separate",
			"married_joint",
			"married_separate_40_1_joint_rest",
		]
		for (const status of statuses) {
			const profile: ThLevyProfile = {
				filingStatus: status,
				allowances: {
					children: [{ birthYear: 2020 }, { birthYear: 2015 }],
					parents: { taxpayerFather: true, taxpayerMother: true, spouseFather: true },
					disabledCareCount: 1,
				},
			}
			expect(fixed(profile.allowances, status)).toBe(expectedFixed(profile))
		}
	})

	it("caps insurance, social security, spouse life, and mortgage allowances", () => {
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
		expect(fixed(profile.allowances, "married_no_income_spouse")).toBe(
			100 * (60_000 + 60_000 + 10_500 + 100_000 + 15_000 + 10_000 + 100_000),
		)
		expect(fixed(profile.allowances, "married_no_income_spouse")).toBe(expectedFixed(profile))
	})
})
