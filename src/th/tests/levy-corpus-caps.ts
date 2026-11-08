import type { ThLevyAllowances } from "../levy/profile-types"
import { toSatang } from "../units"
import { makeCase, type ThLevyCase } from "./levy-corpus"
import { major } from "./levy-satang"

const S1 = "income.section40_1"

type AllowanceField = keyof ThLevyAllowances

const ALLOWANCE_LIMITS: ReadonlyArray<readonly [AllowanceField, number]> = [
	["personal", 60_000],
	["spouse", 60_000],
	["socialSecurity", 10_500],
	["lifeInsurance", 100_000],
	["healthInsurance", 25_000],
	["parentHealthInsurance", 15_000],
	["spouseLifeInsurance", 10_000],
	["mortgageInterest", 100_000],
]

/**
 * Fixed allowances one satang either side of every personal, family, insurance, social-security,
 * and housing ceiling, plus the combined life/health ceiling and the four-parent cap.
 *
 * @statute Thailand Revenue Code Section 47(1)(a)–(j).
 */
export function insuranceCases(): readonly ThLevyCase[] {
	const combined = [-1, 0, 1].map((delta) =>
		makeCase(
			`allowance life+health${delta}`,
			{
				allowances: {
					lifeInsurance: major(toSatang(75_000) + delta),
					healthInsurance: 25_000,
				},
			},
			[[S1, toSatang(3_000_000)]],
		),
	)
	const parents = [3, 4, 5].map((count) =>
		makeCase(
			`allowance parents ${count}`,
			{ filingStatus: "married_no_income_spouse", allowances: { parents: count } },
			[[S1, toSatang(3_000_000)]],
		),
	)
	return [...combined, ...parents, ...limitCases()]
}

function limitCases(): readonly ThLevyCase[] {
	return ALLOWANCE_LIMITS.flatMap(([field, baht]) =>
		[-1, 0, 1].map((delta) =>
			makeCase(
				`insurance ${field} ${baht}${delta}`,
				{
					filingStatus: "married_no_income_spouse",
					allowances: { [field]: major(toSatang(baht) + delta) },
				},
				[[S1, toSatang(3_000_000)]],
			),
		),
	)
}

/**
 * Donations one satang either side of the 10% of net 2x cap and the 10% of remaining-net 1x cap,
 * with whole-baht inputs so the calculator's floating-point subtraction stays exact.
 *
 * @statute Thailand Revenue Code Section 47(7); Royal Decrees No. 428, 558.
 */
export function donationCases(): readonly ThLevyCase[] {
	return [-1, 0, 1].flatMap((delta) => [
		makeCase(
			`donation 2x${delta}`,
			{ allowances: { donation2x: major(toSatang(84_000) + delta) } },
			[[S1, toSatang(1_000_000)]],
		),
		makeCase(
			`donation 1x${delta}`,
			{ allowances: { donation2x: 50_000, donation1x: major(toSatang(75_600) + delta) } },
			[[S1, toSatang(1_000_000)]],
		),
	])
}
