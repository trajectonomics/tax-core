import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyProfile } from "../levy/profile-types"
import { toSatang } from "../units"
import { actualElection, makeCase, type ThLevyCase } from "./levy-corpus"
import { major } from "./levy-satang"

const OTHER = ThLevyIncomeLabel.Section40_4Other
const GENERAL = ThLevyIncomeLabel.Section40_8General
const BRACKETS = [150_000, 300_000, 500_000, 750_000, 1_000_000, 2_000_000, 5_000_000]
const NO_PERSONAL: ThLevyProfile = { allowances: { personal: 0 } }

/** Incomes one satang either side of every bracket bound, plus a 5% half-satang tie. */
export function bracketCases(): readonly ThLevyCase[] {
	const edges = [-100, -1, 0, 1, 100].map((delta) =>
		BRACKETS.map((bound) =>
			makeCase(`bracket ${bound}${delta}`, NO_PERSONAL, [[OTHER, toSatang(bound) + delta]]),
		),
	)
	const tie = makeCase("bracket tie 5%", NO_PERSONAL, [[OTHER, toSatang(150_000) + 10]])
	return [...edges.flat(), tie]
}

const EXPENSE_LIMITS: ReadonlyArray<readonly [string, number]> = [
	[ThLevyIncomeLabel.Section40_2, 200_000],
	[ThLevyIncomeLabel.Section40_3, 200_000],
	[ThLevyIncomeLabel.Section40_7, 100_000],
	[ThLevyIncomeLabel.Section40_8General, 100_000],
	[ThLevyIncomeLabel.Section40_8Entertainer, 300_000],
	[ThLevyIncomeLabel.Section40_8Entertainer, 2_000_000],
]

/** Incomes around the 50%, 60%, entertainer-tier, and entertainer-ceiling expense bounds. */
export function expenseCases(): readonly ThLevyCase[] {
	return EXPENSE_LIMITS.flatMap(([label, baht]) =>
		[-1, 0, 1].map((delta) =>
			makeCase(`expense ${label} ${baht}${delta}`, {}, [[label, toSatang(baht) + delta]]),
		),
	)
}

/**
 * Section 40(8) income wholly consumed by an actual expense, so progressive tax is zero and the
 * Section 48(2) minimum gross tax decides the liability around both of its thresholds.
 */
export function minimumCases(): readonly ThLevyCase[] {
	const bahts = [119_999, 120_000, 120_001, 999_999, 1_000_000, 1_000_001]
	return bahts.flatMap((baht) =>
		[-1, 0, 1].map((delta) => {
			const satang = toSatang(baht) + delta
			return makeCase(
				`minimum ${baht}${delta}`,
				{ expenses: { section40_8: { general: actualElection(major(satang)) } } },
				[[GENERAL, satang]],
			)
		}),
	)
}
