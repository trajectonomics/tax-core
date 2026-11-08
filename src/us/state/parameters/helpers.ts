import type { TaxBracket } from "../../../core/brackets"
import { toMinorUnits } from "../../../core/money"
import { US_2026_PARAMETERS } from "../../parameters"
import type { UsFilingStatus, UsStateCode } from "../../types"
import { UsStateField } from "../../types/state-fields"
import type { UsStateBracketTiers, UsStateDefinition, UsStateParameters } from "./types"

function tiersToBrackets(tiers: UsStateBracketTiers): readonly TaxBracket[] {
	const bounds = tiers.map(([lower]) =>
		toMinorUnits(lower, US_2026_PARAMETERS.currency, UsStateField.BracketBound),
	)
	const brackets: TaxBracket[] = []
	const first = bounds[0] ?? 0
	if (first > 0) brackets.push({ upTo: first, rate: 0 })
	for (let index = 0; index < tiers.length; index++) {
		const tier = tiers[index]
		if (!tier) continue
		brackets.push({ upTo: bounds[index + 1] ?? null, rate: tier[1] })
	}
	return brackets
}

function standardAmounts(
	single: number,
	mfj: number,
	hoh: number | undefined,
	mfs: number | undefined,
): Record<UsFilingStatus, number> {
	return {
		single,
		married_filing_jointly: mfj,
		married_filing_separately: mfs ?? (mfj === single ? single : Math.round(mfj / 2)),
		head_of_household: hoh ?? (single > 0 ? Math.round(single * 1.5) : 0),
	}
}

function exemptionAmounts(
	single: number,
	mfj: number,
	hoh: number | undefined,
	mfs: number | undefined = undefined,
): Record<UsFilingStatus, number> {
	return {
		single,
		married_filing_jointly: mfj,
		married_filing_separately: mfs ?? single,
		head_of_household: hoh ?? single,
	}
}

function resolveMfsTiers(def: UsStateDefinition): UsStateBracketTiers {
	if (def.mfs === "half-mfj") return def.mfj.map(([lower, rate]) => [lower / 2, rate] as const)
	return def.mfs ?? def.single
}

function resolveHohTiers(def: UsStateDefinition): UsStateBracketTiers {
	if (def.hoh === "mfj") return def.mfj
	return def.hoh ?? def.single
}

function optionalRules(def: UsStateDefinition): Partial<UsStateParameters> {
	return {
		...(def.surtax ? { surtax: def.surtax } : {}),
		...(def.standardDeductionPhaseOut
			? { standardDeductionPhaseOut: def.standardDeductionPhaseOut }
			: {}),
		...(def.dependentExemptionPhaseOut
			? { dependentExemptionPhaseOut: def.dependentExemptionPhaseOut }
			: {}),
	}
}

/**
 * Builds a complete state parameter table from a compact statutory definition.
 *
 * Math: Converts dollar thresholds to integer cents; derives vertical-equity defaults
 * (MFS uses single brackets, HoH uses single brackets and 1.5x single standard deduction).
 * Units: Definition amounts are major dollars; emitted bracket bounds are integer cents.
 * Throws: TaxValidationError if a threshold cannot be represented as safe integer cents.
 *
 * @param def Compact state statutory definition.
 * @returns Complete state parameter table.
 */
export function defineState(def: UsStateDefinition): UsStateParameters {
	const personalExemption = def.personalExemption ?? [0, 0]
	const personalCredit = def.personalCredit ?? [0, 0]
	return {
		code: def.code,
		name: def.name,
		type: def.type,
		brackets: {
			single: tiersToBrackets(def.single),
			married_filing_jointly: tiersToBrackets(def.mfj),
			married_filing_separately: tiersToBrackets(resolveMfsTiers(def)),
			head_of_household: tiersToBrackets(resolveHohTiers(def)),
		},
		standardDeduction: standardAmounts(def.std[0], def.std[1], def.std[2], def.stdMfs),
		personalExemption: exemptionAmounts(
			personalExemption[0],
			personalExemption[1],
			personalExemption[2],
			def.personalExemptionMfs,
		),
		personalCredit: exemptionAmounts(personalCredit[0], personalCredit[1], personalCredit[2]),
		dependentExemption: def.dependentExemption ?? 0,
		dependentCredit: def.dependentCredit ?? 0,
		verification: def.verification,
		...optionalRules(def),
	}
}

/**
 * Indexes a complete list of state parameter tables by state code.
 *
 * @param states All supported state parameter tables.
 * @returns Record keyed by every supported state code.
 */
export function indexStates(
	states: readonly UsStateParameters[],
): Record<UsStateCode, UsStateParameters> {
	const record: Partial<Record<UsStateCode, UsStateParameters>> = {}
	for (const state of states) record[state.code] = state
	return record as Record<UsStateCode, UsStateParameters>
}
