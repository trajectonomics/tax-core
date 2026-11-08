import { applyPercentage, type TaxSupportedCurrency, toMinorUnits } from "../../core/money"
import { validateSafeIntegerCount } from "../../core/money/validate"
import type { UsFilingStatus } from "../types"
import { UsStateField } from "../types/state-fields"
import type {
	UsStateLinearPhaseOut,
	UsStatePerStatus,
	UsStatePhaseOut,
	UsStateSteppedPhaseOut,
	UsStateTieredPhaseOut,
} from "./parameters/phase-out-types"

function cents(
	amounts: UsStatePerStatus,
	status: UsFilingStatus,
	currency: TaxSupportedCurrency,
): number {
	return toMinorUnits(amounts[status], currency, UsStateField.PhaseOutThreshold)
}

function stepCents(step: number, currency: TaxSupportedCurrency): number {
	const centsPerStep = toMinorUnits(step, currency, UsStateField.PhaseOutReductionStep)
	validateSafeIntegerCount(centsPerStep, UsStateField.PhaseOutReductionStep, 1)
	return centsPerStep
}

function linearReduction(
	amountCents: number,
	excessCents: number,
	rule: UsStateLinearPhaseOut,
	status: UsFilingStatus,
	currency: TaxSupportedCurrency,
): number {
	const widthCents = cents(rule.width, status, currency)
	const step = rule.reductionStep === undefined ? 0 : stepCents(rule.reductionStep, currency)
	if (excessCents >= widthCents) return step ? Math.floor(amountCents / step) * step : amountCents
	if (!step) return Math.round((amountCents * excessCents) / widthCents)
	return Math.floor((amountCents * excessCents) / (widthCents * step)) * step
}

function steppedReduction(
	amountCents: number,
	excessCents: number,
	rule: UsStateSteppedPhaseOut,
	status: UsFilingStatus,
	currency: TaxSupportedCurrency,
): number {
	const steps = Math.ceil(excessCents / cents(rule.step, status, currency))
	return applyPercentage(amountCents, Math.min(1, steps * rule.ratePerStep))
}

function tieredReduction(
	amountCents: number,
	agiCents: number,
	rule: UsStateTieredPhaseOut,
	status: UsFilingStatus,
	currency: TaxSupportedCurrency,
): number {
	const startCents = cents(rule.start, status, currency)
	const secondCents = cents(rule.second, status, currency)
	const lower = applyPercentage(Math.min(agiCents, secondCents) - startCents, rule.rate)
	const upper = applyPercentage(Math.max(0, agiCents - secondCents), rule.secondRate)
	return Math.min(lower + upper, applyPercentage(amountCents, rule.maxShare))
}

/**
 * Applies a statutory income-based phase-out to a deduction or exemption.
 *
 * Math: linear removes amount x (AGI - start) / width, rounded down to any `reductionStep`
 * multiple; stepped removes ratePerStep of the amount for each step or fraction above start
 * (capped at 100%); tiered removes rate x (AGI up to second - start) + secondRate x (AGI -
 * second), capped at maxShare of the amount. Nothing is removed at or below the start
 * threshold.
 * Units: AGI and amounts are integer cents; thresholds are major dollars converted to cents.
 * Throws: TaxValidationError if a threshold cannot be represented as safe integer cents.
 *
 * @param amountCents Deduction or exemption before the phase-out, in integer cents.
 * @param agiCents Federal adjusted gross income in integer cents.
 * @param status Filing status selecting the thresholds.
 * @param phaseOut Optional statutory phase-out rule.
 * @param currency Supported statutory currency threaded for minor-unit conversion.
 * @returns The amount still allowed after the phase-out, in integer cents.
 * @statute 36 M.R.S. § 5124-C(2); S.C. Code § 12-6-1140(15); Minn. Stat. §§ 290.0121 subd. 2,
 * 290.0123 subd. 5.
 */
export function applyUsStatePhaseOut(
	amountCents: number,
	agiCents: number,
	status: UsFilingStatus,
	phaseOut: UsStatePhaseOut | undefined,
	currency: TaxSupportedCurrency,
): number {
	if (!phaseOut) return amountCents
	const excessCents = agiCents - cents(phaseOut.start, status, currency)
	if (excessCents <= 0) return amountCents
	if (phaseOut.kind === "tiered") {
		return amountCents - tieredReduction(amountCents, agiCents, phaseOut, status, currency)
	}
	const reduction =
		phaseOut.kind === "linear"
			? linearReduction(amountCents, excessCents, phaseOut, status, currency)
			: steppedReduction(amountCents, excessCents, phaseOut, status, currency)
	return amountCents - reduction
}
