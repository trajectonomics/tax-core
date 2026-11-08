import type { ThLevyExpenseChoice, ThLevyProfile } from "../levy/profile-types"
import { bracketCases, expenseCases, minimumCases } from "./levy-corpus-brackets"
import { donationCases, insuranceCases } from "./levy-corpus-caps"
import { contributionCases } from "./levy-corpus-contributions"
import { electionCases } from "./levy-corpus-elections"
import { randomCases } from "./levy-corpus-random"

/** One golden-corpus input: a taxpayer profile plus the satang totals its Flows would tally. */
export interface ThLevyCase {
	/** Stable case label used in failure output. */
	readonly name: string
	/** Profile frozen into the emitted Levy. */
	readonly profile: ThLevyProfile
	/** `gross` tally totals in satang. */
	readonly income: ReadonlyMap<string, number>
	/** `funded` tally totals in satang. */
	readonly contributions: ReadonlyMap<string, number>
}

/** Builds one corpus case from label/total pairs. */
export function makeCase(
	name: string,
	profile: ThLevyProfile,
	income: ReadonlyArray<readonly [string, number]>,
	contributions: ReadonlyArray<readonly [string, number]> = [],
): ThLevyCase {
	return {
		name,
		profile,
		income: new Map(income),
		contributions: new Map(contributions),
	}
}

/** Builds an actual-expense election for an amount in THB major units. */
export function actualElection(amount: number): ThLevyExpenseChoice {
	return { election: "actual", actualExpense: amount }
}

/**
 * Builds the golden corpus: targeted statutory boundaries plus deterministic random combinations.
 *
 * Purpose: Gives the golden test several thousand inputs without any non-deterministic source.
 * Units: Income and contribution totals are integer satang; profile amounts are THB major units.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export function buildCorpus(): readonly ThLevyCase[] {
	return [
		...bracketCases(),
		...expenseCases(),
		...contributionCases(),
		...insuranceCases(),
		...minimumCases(),
		...donationCases(),
		...electionCases(),
		...randomCases(3000),
	]
}
