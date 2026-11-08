import type { TaxBracket } from "../../../core/brackets"
import type { UsFilingStatus, UsStateCode, UsStateTaxType } from "../../types"
import type { UsStatePhaseOut } from "./phase-out-types"
import type { UsStateVerification } from "./verification"

/** Lower-bound and rate tuple for a state bracket tier, in major dollars and rate ratio. */
export type UsStateBracketTier = readonly [lowerDollars: number, rate: number]

/** Ordered list of state bracket lower bounds and statutory rates. */
export type UsStateBracketTiers = readonly UsStateBracketTier[]

/** Surtax threshold: one amount for every filing status, or an amount per filing status. */
export type UsStateSurtaxThreshold = number | Readonly<Record<UsFilingStatus, number>>

/** Optional millionaire or high-income surtax applied above a taxable-income threshold. */
export interface UsStateSurtax {
	readonly threshold: UsStateSurtaxThreshold
	readonly rate: number
}

/** Compact statutory definition used by the parameter builder. */
export interface UsStateDefinition {
	readonly code: UsStateCode
	readonly name: string
	readonly type: UsStateTaxType
	readonly single: UsStateBracketTiers
	readonly mfj: UsStateBracketTiers
	/** Explicit separate-filer tiers, or "half-mfj" when the state halves its joint thresholds. */
	readonly mfs?: UsStateBracketTiers | "half-mfj"
	/** Explicit head-of-household tiers, or "mfj" when the state applies its joint schedule. */
	readonly hoh?: UsStateBracketTiers | "mfj"
	readonly std: readonly [single: number, mfj: number, hoh?: number]
	/** Married-filing-separately standard deduction when it is not half the joint amount. */
	readonly stdMfs?: number
	readonly personalExemption?: readonly [single: number, mfj: number, hoh?: number]
	/** Married-filing-separately personal exemption when it differs from the single amount. */
	readonly personalExemptionMfs?: number
	readonly personalCredit?: readonly [single: number, mfj: number, hoh?: number]
	readonly dependentExemption?: number
	readonly dependentCredit?: number
	readonly surtax?: UsStateSurtax
	/** Income-based reduction of the standard deduction. */
	readonly standardDeductionPhaseOut?: UsStatePhaseOut
	/** Income-based disallowance of the dependent exemption. */
	readonly dependentExemptionPhaseOut?: UsStatePhaseOut
	/** How far the figures were verified against an official document. */
	readonly verification: UsStateVerification
}

/** Complete statutory parameter table for one state's 2026 individual income tax. */
export interface UsStateParameters {
	readonly code: UsStateCode
	readonly name: string
	readonly type: UsStateTaxType
	readonly brackets: Record<UsFilingStatus, readonly TaxBracket[]>
	readonly standardDeduction: Record<UsFilingStatus, number>
	readonly personalExemption: Record<UsFilingStatus, number>
	readonly personalCredit: Record<UsFilingStatus, number>
	readonly dependentExemption: number
	readonly dependentCredit: number
	readonly surtax?: UsStateSurtax
	readonly standardDeductionPhaseOut?: UsStatePhaseOut
	readonly dependentExemptionPhaseOut?: UsStatePhaseOut
	readonly verification: UsStateVerification
}
