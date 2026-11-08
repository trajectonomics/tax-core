import type { UsStateCode } from "../../types"
import { defineState } from "./helpers"
import type { UsStateParameters } from "./types"

/**
 * Builds the zero-rate parameter table for a state with no 2026 wage income tax.
 *
 * Units: All amounts are zero major dollars.
 */
function noTaxState(code: UsStateCode, name: string): UsStateParameters {
	return defineState({
		code,
		name,
		verification: "official",
		type: "none",
		single: [[0, 0]],
		mfj: [[0, 0]],
		std: [0, 0],
	})
}

/**
 * Statutory parameter table for the nine states with no 2026 wage income tax.
 *
 * Washington taxes only long-term capital gains above a high threshold, and New Hampshire and
 * Tennessee repealed their interest and dividends taxes, so none taxes wage or ordinary income.
 *
 * @statute State constitutions and statutes repealing or prohibiting an individual income tax.
 */
export const NO_TAX_STATES: readonly UsStateParameters[] = [
	noTaxState("AK", "Alaska"),
	noTaxState("FL", "Florida"),
	noTaxState("NV", "Nevada"),
	noTaxState("NH", "New Hampshire"),
	noTaxState("SD", "South Dakota"),
	noTaxState("TN", "Tennessee"),
	noTaxState("TX", "Texas"),
	noTaxState("WA", "Washington"),
	noTaxState("WY", "Wyoming"),
]
