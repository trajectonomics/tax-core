import { TH_LEVY_CONTRIBUTION_LABELS, TH_LEVY_INCOME_LABELS } from "../levy/labels"
import type {
	ThLevyAllowances,
	ThLevyExpenseChoice,
	ThLevyProfile,
	ThLevySection40_4Elections,
} from "../levy/profile-types"
import type { ThFilingStatus, ThFinalWithholdingElection } from "../types"
import { makeCase, type ThLevyCase } from "./levy-corpus"
import { major } from "./levy-satang"

type Next = (bound: number) => number
type MutableAllowances = { -readonly [K in keyof ThLevyAllowances]: ThLevyAllowances[K] }

const STATUSES: readonly ThFilingStatus[] = [
	"single",
	"married_no_income_spouse",
	"married_separate",
	"married_joint",
	"married_separate_40_1_joint_rest",
]
const ELECTIONS: readonly ThFinalWithholdingElection[] = ["include", "final"]

function source(seed: number): Next {
	let state = seed
	return (bound) => {
		state = (state * 48271) % 2147483647
		return state % bound
	}
}

function wholeBaht(next: Next, maxBaht: number): number {
	return next(maxBaht + 1) * 100
}

function entries(next: Next, labels: readonly string[], count: number, maxBaht: number) {
	const picked: Array<[string, number]> = []
	for (let index = 0; index < count; index++) {
		const label = labels[next(labels.length)] ?? ""
		picked.push([label, wholeBaht(next, maxBaht)])
	}
	return picked
}

function familyOf(next: Next): ThLevyAllowances {
	const value: MutableAllowances = {}
	if (next(2) === 1) value.personal = wholeBaht(next, 60_000)
	if (next(2) === 1) value.spouse = wholeBaht(next, 60_000)
	if (next(3) === 0) {
		value.children = { totalCount: next(4), secondPlusBorn2018OrLaterCount: next(3) }
	}
	if (next(4) === 0) value.parents = next(5)
	if (next(4) === 0) value.disabledCareCount = next(2)
	return value
}

function insuranceOf(next: Next): ThLevyAllowances {
	const value: MutableAllowances = {}
	if (next(2) === 1) value.socialSecurity = wholeBaht(next, 15_000)
	if (next(2) === 1) value.lifeInsurance = wholeBaht(next, 120_000)
	if (next(2) === 1) value.healthInsurance = wholeBaht(next, 30_000)
	if (next(2) === 1) value.parentHealthInsurance = wholeBaht(next, 20_000)
	if (next(2) === 1) value.spouseLifeInsurance = wholeBaht(next, 15_000)
	if (next(2) === 1) value.mortgageInterest = wholeBaht(next, 150_000)
	return value
}

function expensesOf(next: Next): ThLevyProfile["expenses"] {
	const actual = (): ThLevyExpenseChoice => ({
		election: "actual",
		actualExpense: major(wholeBaht(next, 500_000)),
	})
	return {
		...(next(2) === 1 ? { section40_3: actual() } : {}),
		...(next(2) === 1 ? { section40_5: { building: actual() } } : {}),
		...(next(2) === 1 ? { section40_6: { medical: actual() } } : {}),
		...(next(2) === 1 ? { section40_8: { entertainer: actual() } } : {}),
	}
}

function regimesOf(next: Next): ThLevySection40_4Elections {
	return {
		interest: ELECTIONS[next(2)] ?? "include",
		dividends: ELECTIONS[next(2)] ?? "include",
		digitalAssets: ELECTIONS[next(2)] ?? "include",
		...(next(2) === 1 ? { dividendCorpTaxRate: 0.2 } : {}),
	}
}

/**
 * Deterministic pseudo-random combinations over every income class, contribution, and election.
 * Whole-baht totals (multiples of 100 satang) keep the calculator's float stages exact.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export function randomCases(count: number): readonly ThLevyCase[] {
	const next = source(20260101)
	const cases: ThLevyCase[] = []
	for (let index = 0; index < count; index++) {
		cases.push(
			makeCase(
				`random ${index}`,
				{
					filingStatus: STATUSES[next(STATUSES.length)] ?? "single",
					allowances: { ...familyOf(next), ...insuranceOf(next) },
					expenses: expensesOf(next),
					section40_4: regimesOf(next),
				},
				entries(next, TH_LEVY_INCOME_LABELS, 1 + next(3), 2_000_000),
				entries(next, TH_LEVY_CONTRIBUTION_LABELS, next(3), 1_000_000),
			),
		)
	}
	return cases
}
