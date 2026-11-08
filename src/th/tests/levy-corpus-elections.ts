import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyAllowances, ThLevyProfile } from "../levy/profile-types"
import type { ThFilingStatus } from "../types"
import { toSatang } from "../units"
import { actualElection, makeCase, type ThLevyCase } from "./levy-corpus"
import { major } from "./levy-satang"

const S1 = ThLevyIncomeLabel.Section40_1
const STATUSES: readonly ThFilingStatus[] = [
	"single",
	"married_no_income_spouse",
	"married_separate",
	"married_joint",
	"married_separate_40_1_joint_rest",
]
const CHILDREN: ReadonlyArray<ThLevyAllowances["children"]> = [
	undefined,
	[{ birthYear: 2020 }, { birthYear: 2015 }],
	{ totalCount: 3, secondPlusBorn2018OrLaterCount: 5 },
]

function familyCases(): readonly ThLevyCase[] {
	return STATUSES.flatMap((filingStatus) =>
		CHILDREN.map((children, index) =>
			makeCase(
				`family ${filingStatus} ${index}`,
				{
					filingStatus,
					allowances: {
						children,
						parents: { taxpayerFather: true, spouseFather: true },
						spouse: 60_000,
					},
				},
				[[S1, toSatang(1_500_000)]],
			),
		),
	)
}

const ELECTABLE: ReadonlyArray<
	readonly [string, ThLevyIncomeLabel, (actual: number) => ThLevyProfile]
> = [
	[
		"40_3",
		ThLevyIncomeLabel.Section40_3,
		(a) => ({ expenses: { section40_3: actualElection(a) } }),
	],
	[
		"40_5.building",
		ThLevyIncomeLabel.Section40_5Building,
		(a) => ({ expenses: { section40_5: { building: actualElection(a) } } }),
	],
	[
		"40_6.medical",
		ThLevyIncomeLabel.Section40_6Medical,
		(a) => ({ expenses: { section40_6: { medical: actualElection(a) } } }),
	],
	[
		"40_7",
		ThLevyIncomeLabel.Section40_7,
		(a) => ({ expenses: { section40_7: actualElection(a) } }),
	],
	[
		"40_8.entertainer",
		ThLevyIncomeLabel.Section40_8Entertainer,
		(a) => ({ expenses: { section40_8: { entertainer: actualElection(a) } } }),
	],
]

function actualCases(): readonly ThLevyCase[] {
	return ELECTABLE.flatMap(([name, label, profileOf]) =>
		[-1, 0, 1].map((delta) =>
			makeCase(`actual ${name}${delta}`, profileOf(major(toSatang(120_000) + delta)), [
				[label, toSatang(120_000)],
			]),
		),
	)
}

const SECTION_40_4: readonly (readonly [string, ThLevyProfile])[] = [
	["all final", { section40_4: { interest: "final", dividends: "final", digitalAssets: "final" } }],
	["credit tie", { section40_4: { dividendCorpTaxRate: 0.2 } }],
	["interest final", { section40_4: { interest: "final" } }],
	["digital final", { section40_4: { digitalAssets: "final" } }],
	["dividends final with rate", { section40_4: { dividends: "final", dividendCorpTaxRate: 0.2 } }],
]

function regimeCases(): readonly ThLevyCase[] {
	return SECTION_40_4.map(([name, profile]) =>
		makeCase(`regime ${name}`, profile, [
			[ThLevyIncomeLabel.Section40_4Other, toSatang(100_000)],
			[ThLevyIncomeLabel.Section40_4Interest, 1010],
			[ThLevyIncomeLabel.Section40_4Dividends, name === "credit tie" ? 1010 : toSatang(20_000)],
			[ThLevyIncomeLabel.Section40_4DigitalAssets, toSatang(30_000)],
		]),
	)
}

/**
 * Filing-status families, actual-expense elections one satang either side of income, and every
 * Section 40(4) final-withholding and Section 47 bis combination.
 *
 * @statute Thailand Revenue Code Sections 40(4), 47, 47 bis, 50(2)(g), 57 ter.
 */
export function electionCases(): readonly ThLevyCase[] {
	return [...familyCases(), ...actualCases(), ...regimeCases()]
}
