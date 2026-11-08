import { toMinorUnits } from "../../core/money"
import { ThLevyContributionLabel } from "../levy/labels"
import type { ThLevyExpenseChoice, ThLevyProfile } from "../levy/profile-types"
import { TH_2026_PARAMETERS } from "../parameters"
import type {
	ThAllowancesInput,
	ThExpenseElectableIncome,
	ThSection40_4Dividend,
	ThSection40_4Source,
} from "../types"
import { ThFinalWithholdingElection } from "../types"
import { fromSatang, toSatang } from "../units"

/** Tally totals in integer satang, keyed by the Levy label the caller would put on a Flow. */
export type ThSatangTotals = ReadonlyMap<string, number>

/** Converts a satang total to THB major units for the calculator's public input. */
export function major(satang: number): number {
	return fromSatang(satang)
}

/** Reads one label from satang totals, defaulting an absent label to zero. */
export function amount(totals: ThSatangTotals, label: string): number {
	return major(totals.get(label) ?? 0)
}

/** Converts a satang total to THB major units for a calculator figure. */
export function satangOf(value: number): number {
	return toSatang(value)
}

/** Converts a calculator figure that may be a refund (negative) to integer satang. */
export function signedSatangOf(value: number): number {
	return toMinorUnits(value, TH_2026_PARAMETERS.currency, "amount", { allowNegative: true })
}

/** Builds the calculator's electable income item for one expense election. */
export function electable(
	satang: number,
	choice: ThLevyExpenseChoice | undefined,
): ThExpenseElectableIncome {
	const value = major(satang)
	if (choice?.election === "actual") {
		return { amount: value, expenseElection: "actual", actualExpense: choice.actualExpense ?? 0 }
	}
	return { amount: value, expenseElection: "standard" }
}

/** Builds one Section 40(4) source input with the profile's election. */
export function source(
	satang: number,
	election: ThFinalWithholdingElection | undefined,
): ThSection40_4Source {
	return { amount: major(satang), election: election ?? ThFinalWithholdingElection.Include }
}

/** Builds the Section 40(4) dividend source, including the Section 47 bis rate when fixed. */
export function dividends(satang: number, profile: ThLevyProfile): ThSection40_4Dividend {
	const section = profile.section40_4
	const rate = section?.dividendCorpTaxRate
	return {
		...source(satang, section?.dividends),
		...(rate === undefined ? {} : { corpTaxRate: rate }),
	}
}

/** Builds the contribution allowance inputs from the `funded` tally totals. */
export function contributionAllowances(contributions: ThSatangTotals): ThAllowancesInput {
	return {
		rmf: amount(contributions, ThLevyContributionLabel.Rmf),
		ssf: amount(contributions, ThLevyContributionLabel.Ssf),
		pvd: amount(contributions, ThLevyContributionLabel.Pvd),
		gpf: amount(contributions, ThLevyContributionLabel.Gpf),
		nsf: amount(contributions, ThLevyContributionLabel.Nsf),
		pensionLifeInsurance: amount(contributions, ThLevyContributionLabel.PensionLifeInsurance),
		thaiEsg: amount(contributions, ThLevyContributionLabel.ThaiEsg),
	}
}
