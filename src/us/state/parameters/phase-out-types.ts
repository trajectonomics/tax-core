import type { UsFilingStatus } from "../../types"

/** Major-dollar amount for each filing status. */
export type UsStatePerStatus = Readonly<Record<UsFilingStatus, number>>

/**
 * Linear phase-out to zero: the allowed share falls from 1 to 0 as federal AGI rises from
 * `start` to `start + width` (Maine standard deduction, 36 M.R.S. § 5124-C(2)).
 *
 * When `reductionStep` is set, the removed amount is rounded down to that multiple in major
 * dollars before subtraction (South Carolina SCIAD, S.C. Code § 12-6-1140(15)(c)).
 */
export interface UsStateLinearPhaseOut {
	readonly kind: "linear"
	readonly start: UsStatePerStatus
	readonly width: UsStatePerStatus
	readonly reductionStep?: number
}

/**
 * Stepped disallowance: `ratePerStep` of the amount is disallowed for each `step` dollars, or
 * fraction, of AGI above `start`, up to 100% (Minnesota dependent exemption, § 290.0121 subd. 2).
 */
export interface UsStateSteppedPhaseOut {
	readonly kind: "stepped"
	readonly start: UsStatePerStatus
	readonly step: UsStatePerStatus
	readonly ratePerStep: number
}

/**
 * Two-rate reduction: `rate` of AGI between `start` and `second` plus `secondRate` of AGI
 * above `second` is removed, never more than `maxShare` of the amount (Minnesota standard
 * deduction, § 290.0123 subd. 5).
 */
export interface UsStateTieredPhaseOut {
	readonly kind: "tiered"
	readonly start: UsStatePerStatus
	readonly second: UsStatePerStatus
	readonly rate: number
	readonly secondRate: number
	readonly maxShare: number
}

/** Statutory income-based reduction of a deduction or exemption. */
export type UsStatePhaseOut = UsStateLinearPhaseOut | UsStateSteppedPhaseOut | UsStateTieredPhaseOut
