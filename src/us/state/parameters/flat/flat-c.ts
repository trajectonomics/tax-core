import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"

/**
 * 2026 Louisiana individual income tax parameters.
 *
 * 2025 Act 1 flattened the schedule to a single 3% tier. Standard deduction per RIB 26-005
 * (CPI-U estimate as of 2025-12-01; head of household equals the joint amount, R.S. 47:294).
 *
 * @statute La. Stat. Ann. § 47:32
 */
const LOUISIANA: UsStateParameters = defineState({
	code: "LA",
	name: "Louisiana",
	verification: "official",
	type: "flat",
	single: [[0, 0.03]],
	mfj: [[0, 0.03]],
	std: [12875, 25750, 25750],
})

/**
 * 2026 Ohio individual income tax parameters.
 *
 * Single 2.75% rate above a $26,050 zero-rate threshold.
 *
 * @statute Ohio Rev. Code § 5747.02
 */
const OHIO: UsStateParameters = defineState({
	code: "OH",
	name: "Ohio",
	verification: "partial",
	type: "flat",
	single: [[26_050, 0.0275]],
	mfj: [[26_050, 0.0275]],
	std: [0, 0],
	personalExemption: [2400, 4800],
	dependentExemption: 2_400,
})

/** Statutory parameter table for Louisiana and Ohio flat-rate individual income taxes. */
export const FLAT_STATES_C: readonly UsStateParameters[] = [LOUISIANA, OHIO]
