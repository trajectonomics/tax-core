import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseChoice, ThLevyProfile } from "../levy/profile-types"
import type { ThAssessableIncomeInput, ThExpenseElectableIncome } from "../types"
import { amount, dividends, electable, source, type ThSatangTotals } from "./levy-satang"

function pick(
	totals: ThSatangTotals,
	label: string,
	choice: ThLevyExpenseChoice | undefined,
): ThExpenseElectableIncome {
	return electable(totals.get(label) ?? 0, choice)
}

export function incomeFor(profile: ThLevyProfile, totals: ThSatangTotals): ThAssessableIncomeInput {
	const elections = profile.expenses
	const s4 = profile.section40_4
	return {
		section40_1: amount(totals, ThLevyIncomeLabel.Section40_1),
		section40_2: amount(totals, ThLevyIncomeLabel.Section40_2),
		section40_3: pick(totals, ThLevyIncomeLabel.Section40_3, elections?.section40_3),
		section40_4: {
			amount: amount(totals, ThLevyIncomeLabel.Section40_4Other),
			interest: source(totals.get(ThLevyIncomeLabel.Section40_4Interest) ?? 0, s4?.interest),
			dividends: dividends(totals.get(ThLevyIncomeLabel.Section40_4Dividends) ?? 0, profile),
			digitalAssets: source(
				totals.get(ThLevyIncomeLabel.Section40_4DigitalAssets) ?? 0,
				s4?.digitalAssets,
			),
		},
		section40_5: {
			building: pick(
				totals,
				ThLevyIncomeLabel.Section40_5Building,
				elections?.section40_5?.building,
			),
			agriculturalLand: pick(
				totals,
				ThLevyIncomeLabel.Section40_5AgriculturalLand,
				elections?.section40_5?.agriculturalLand,
			),
			nonAgriculturalLand: pick(
				totals,
				ThLevyIncomeLabel.Section40_5NonAgriculturalLand,
				elections?.section40_5?.nonAgriculturalLand,
			),
			vehicles: pick(
				totals,
				ThLevyIncomeLabel.Section40_5Vehicles,
				elections?.section40_5?.vehicles,
			),
			other: pick(totals, ThLevyIncomeLabel.Section40_5Other, elections?.section40_5?.other),
		},
		section40_6: {
			medical: pick(totals, ThLevyIncomeLabel.Section40_6Medical, elections?.section40_6?.medical),
			law: pick(totals, ThLevyIncomeLabel.Section40_6Law, elections?.section40_6?.law),
			engineering: pick(
				totals,
				ThLevyIncomeLabel.Section40_6Engineering,
				elections?.section40_6?.engineering,
			),
			architecture: pick(
				totals,
				ThLevyIncomeLabel.Section40_6Architecture,
				elections?.section40_6?.architecture,
			),
			accounting: pick(
				totals,
				ThLevyIncomeLabel.Section40_6Accounting,
				elections?.section40_6?.accounting,
			),
			fineArts: pick(
				totals,
				ThLevyIncomeLabel.Section40_6FineArts,
				elections?.section40_6?.fineArts,
			),
			other: pick(totals, ThLevyIncomeLabel.Section40_6Other, elections?.section40_6?.other),
		},
		section40_7: pick(totals, ThLevyIncomeLabel.Section40_7, elections?.section40_7),
		section40_8: {
			general: pick(totals, ThLevyIncomeLabel.Section40_8General, elections?.section40_8?.general),
			entertainer: pick(
				totals,
				ThLevyIncomeLabel.Section40_8Entertainer,
				elections?.section40_8?.entertainer,
			),
		},
	}
}
