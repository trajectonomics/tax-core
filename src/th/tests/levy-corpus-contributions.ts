import { ThLevyContributionLabel } from "../levy/labels"
import { toSatang } from "../units"
import { makeCase, type ThLevyCase } from "./levy-corpus"

const S1 = "income.section40_1"

const CONTRIBUTION_LIMITS: ReadonlyArray<readonly [ThLevyContributionLabel, number]> = [
	[ThLevyContributionLabel.Rmf, 500_000],
	[ThLevyContributionLabel.Ssf, 200_000],
	[ThLevyContributionLabel.Pvd, 500_000],
	[ThLevyContributionLabel.Gpf, 500_000],
	[ThLevyContributionLabel.Nsf, 30_000],
	[ThLevyContributionLabel.PensionLifeInsurance, 200_000],
	[ThLevyContributionLabel.ThaiEsg, 300_000],
]

const PERCENT_LIMITS: ReadonlyArray<readonly [ThLevyContributionLabel, number]> = [
	[ThLevyContributionLabel.Rmf, 300_000],
	[ThLevyContributionLabel.Ssf, 200_000],
	[ThLevyContributionLabel.Pvd, 150_000],
	[ThLevyContributionLabel.Gpf, 300_000],
	[ThLevyContributionLabel.Nsf, 30_000],
	[ThLevyContributionLabel.PensionLifeInsurance, 150_000],
	[ThLevyContributionLabel.ThaiEsg, 300_000],
]

function casesAt(
	prefix: string,
	salaryBaht: number,
	limits: ReadonlyArray<readonly [ThLevyContributionLabel, number]>,
): readonly ThLevyCase[] {
	return limits.flatMap(([label, baht]) =>
		[-1, 0, 1].map((delta) =>
			makeCase(
				`contribution ${prefix} ${label} ${baht}${delta}`,
				{},
				[[S1, toSatang(salaryBaht)]],
				[[label, toSatang(baht) + delta]],
			),
		),
	)
}

/**
 * Contributions one satang either side of every absolute ceiling and every percentage-of-income
 * limit, plus the Retirement Cluster's combined 500,000 THB ceiling.
 *
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export function contributionCases(): readonly ThLevyCase[] {
	const combined = [-1, 0, 1].map((delta) =>
		makeCase(
			`contribution cluster combined${delta}`,
			{},
			[[S1, toSatang(4_000_000)]],
			[
				[ThLevyContributionLabel.Rmf, toSatang(300_000)],
				[ThLevyContributionLabel.Ssf, toSatang(200_000)],
				[ThLevyContributionLabel.Pvd, toSatang(100_000) + delta],
			],
		),
	)
	return [
		...casesAt("absolute", 4_000_000, CONTRIBUTION_LIMITS),
		...casesAt("percent", 1_000_000, PERCENT_LIMITS),
		...combined,
	]
}
