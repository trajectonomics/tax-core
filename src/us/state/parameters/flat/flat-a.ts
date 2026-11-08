import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"

/**
 * 2026 Arizona individual income tax parameters.
 *
 * Federal-conforming standard deduction; $100 dependent credit.
 *
 * @statute Ariz. Rev. Stat. § 43-1011
 */
const ARIZONA: UsStateParameters = defineState({
	code: "AZ",
	name: "Arizona",
	verification: "unconfirmed",
	type: "flat",
	single: [[0, 0.025]],
	mfj: [[0, 0.025]],
	std: [16100, 32200, 24150],
	dependentCredit: 100,
})

/**
 * 2026 Colorado individual income tax parameters.
 *
 * @statute Colo. Rev. Stat. § 39-22-104
 */
const COLORADO: UsStateParameters = defineState({
	code: "CO",
	name: "Colorado",
	verification: "unconfirmed",
	type: "flat",
	single: [[0, 0.044]],
	mfj: [[0, 0.044]],
	std: [16100, 32200],
})

/**
 * 2026 Georgia individual income tax parameters.
 *
 * 4.99% flat, $15,000 / $30,000 standard deduction and $5,000 dependent allowance per the Georgia
 * DOR revised 2026 Employer's Tax Guide (June 2026; HB 463).
 *
 * @statute Ga. Code Ann. § 48-7-20
 */
const GEORGIA: UsStateParameters = defineState({
	code: "GA",
	name: "Georgia",
	verification: "official",
	type: "flat",
	single: [[0, 0.0499]],
	mfj: [[0, 0.0499]],
	std: [15000, 30000, 15000],
	dependentExemption: 5_000,
})

/**
 * 2026 Idaho individual income tax parameters.
 *
 * Zero-rate bracket below the statutory threshold.
 *
 * @statute Idaho Code § 63-3024
 */
const IDAHO: UsStateParameters = defineState({
	code: "ID",
	name: "Idaho",
	verification: "reported",
	type: "flat",
	single: [[4_811, 0.053]],
	mfj: [[9_622, 0.053]],
	std: [16100, 32200],
})

/**
 * 2026 Illinois individual income tax parameters.
 *
 * @statute 35 Ill. Comp. Stat. 5/201
 */
const ILLINOIS: UsStateParameters = defineState({
	code: "IL",
	name: "Illinois",
	verification: "reported",
	type: "flat",
	single: [[0, 0.0495]],
	mfj: [[0, 0.0495]],
	std: [0, 0],
	personalExemption: [2925, 5850],
	dependentExemption: 2_925,
})

/**
 * 2026 Indiana individual income tax parameters.
 *
 * @statute Ind. Code § 6-3-2-1
 */
const INDIANA: UsStateParameters = defineState({
	code: "IN",
	name: "Indiana",
	verification: "reported",
	type: "flat",
	single: [[0, 0.0295]],
	mfj: [[0, 0.0295]],
	std: [0, 0],
	personalExemption: [1000, 2000],
	dependentExemption: 1_000,
})

/**
 * 2026 Iowa individual income tax parameters.
 *
 * @statute Iowa Code § 422.5
 */
const IOWA: UsStateParameters = defineState({
	code: "IA",
	name: "Iowa",
	verification: "official",
	type: "flat",
	single: [[0, 0.038]],
	mfj: [[0, 0.038]],
	std: [16100, 32200],
	personalCredit: [40, 80],
	dependentCredit: 40,
})

const STATES: readonly UsStateParameters[] = [
	ARIZONA,
	COLORADO,
	GEORGIA,
	IDAHO,
	ILLINOIS,
	INDIANA,
	IOWA,
]

/** Statutory parameter table for the 2026 flat-rate states in group A. */
export const FLAT_STATES_A: readonly UsStateParameters[] = STATES
