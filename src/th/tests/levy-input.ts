import type { ThLevyProfile } from "../levy/profile-types"
import { TH_2026_PARAMETERS } from "../parameters"
import type { ThTaxInput } from "../types"
import { incomeFor } from "./levy-income"
import { contributionAllowances, type ThSatangTotals } from "./levy-satang"

/**
 * Builds the calculator input equivalent to one emitted Levy plus its Flow tallies.
 *
 * Purpose: Lets the golden corpus run the same amounts through `calculateThTax` and the Levy.
 * Math: Converts satang totals to THB major units and applies the profile's emit-time elections.
 * Units: Satang totals in, THB major-unit calculator input out.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 50(2)(g).
 */
export function thTaxInputFor(
	profile: ThLevyProfile,
	incomeTotals: ThSatangTotals,
	contributions: ThSatangTotals = new Map(),
): ThTaxInput {
	return {
		taxYear: TH_2026_PARAMETERS.taxYear,
		filingStatus: profile.filingStatus ?? "single",
		income: incomeFor(profile, incomeTotals),
		allowances: { ...profile.allowances, ...contributionAllowances(contributions) },
	}
}
