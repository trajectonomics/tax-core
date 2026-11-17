import {
	applyPercentage,
	multiplySafeInteger,
	validateMonetaryAmount,
	validateSafeIntegerCount,
} from "../../core/money"
import { TH_2026_PARAMETERS } from "../parameters"
import {
	type ThSeparateSheetBreakdown,
	type ThSeparateSheetInput,
	ThSeparateSheetPaymentType,
	ThSpecialRegimeField,
} from "../types"
import { fromSatang, toSatang } from "../units"
import { resolveChoice } from "../validate"
import { evaluateThBracketSet } from "./bracket-eval"

const EMPTY_INPUT: ThSeparateSheetInput = { amount: 0, yearsOfService: 0, lastDailyWage: 0 }

/**
 * Calculates the Section 48(5) separate sheet for one-time severance/retirement lump sums.
 *
 * Purpose: Applies the severance exemption, then taxes an eligible remainder on its own schedule
 * or returns the ineligible remainder for regular treatment.
 * Math: For `paymentType` severance (the default) at ANY length of service:
 * exemption = min(amount, 400 * lastDailyWage, 600,000); `"retirement"` payments get none.
 * remainder = amount - exemption. With yearsOfService >= 5: fixed = min(7,000 * years, remainder);
 * percentage expense = 50% of (remainder - fixed), half-up; net = remainder - fixed - percentage,
 * taxed on the separate schedule (5%..35%, no 0% tier). With fewer than 5 years only the remainder
 * is returned in `addedToSection40_1` for the regular computation.
 * Units: Inputs and outputs in THB major units; arithmetic in integer satang.
 * Throws: TaxValidationError for negative/non-finite money, a non-safe-integer/negative `yearsOfService`,
 * an unknown `paymentType`, or a wage/years value whose scaled satang amount exceeds safe integers.
 *
 * @statute Thailand Revenue Code Section 48(5); Section 42(1) (severance exemption).
 */
export function calculateSeparateSheet(
	input: ThSeparateSheetInput = EMPTY_INPUT,
): ThSeparateSheetBreakdown {
	const rules = TH_2026_PARAMETERS.separateSheet
	validateMonetaryAmount(input.amount, ThSpecialRegimeField.SeparateSheetAmount)
	validateMonetaryAmount(input.lastDailyWage, ThSpecialRegimeField.SeparateSheetLastDailyWage)
	validateSafeIntegerCount(input.yearsOfService, ThSpecialRegimeField.SeparateSheetYears)
	const paymentType = resolveChoice(
		input.paymentType,
		ThSeparateSheetPaymentType,
		ThSeparateSheetPaymentType.Severance,
		ThSpecialRegimeField.SeparateSheetPaymentType,
	)

	const years = input.yearsOfService
	const isEligible = years >= rules.minYearsOfService
	const amountSatang = toSatang(input.amount, ThSpecialRegimeField.SeparateSheetAmount)
	const wageSatang = toSatang(input.lastDailyWage, ThSpecialRegimeField.SeparateSheetLastDailyWage)
	const isSeverance = paymentType === ThSeparateSheetPaymentType.Severance
	const wageCap = isSeverance
		? multiplySafeInteger(
				wageSatang,
				rules.exemptionWageDays,
				ThSpecialRegimeField.SeparateSheetLastDailyWage,
			)
		: 0
	const exemption = isSeverance
		? Math.min(amountSatang, wageCap, toSatang(rules.exemptionCeiling))
		: 0
	const remainder = amountSatang - exemption
	const fixedCap = multiplySafeInteger(
		toSatang(rules.expensePerYearOfService),
		years,
		ThSpecialRegimeField.SeparateSheetYears,
	)
	const fixed = isEligible ? Math.min(remainder, fixedCap) : 0
	const percentage = isEligible ? applyPercentage(remainder - fixed, rules.remainderExpenseRate) : 0
	const net = fromSatang(isEligible ? remainder - fixed - percentage : 0)

	const evaluated = evaluateThBracketSet(net, net, rules.brackets)
	return {
		amount: input.amount,
		yearsOfService: years,
		lastDailyWage: input.lastDailyWage,
		isEligible,
		addedToSection40_1: isEligible ? 0 : fromSatang(remainder),
		wageBasedCap: fromSatang(wageCap),
		exemptionCeiling: rules.exemptionCeiling,
		paymentType,
		exemption: fromSatang(exemption),
		remainder: fromSatang(remainder),
		fixedExpense: fromSatang(fixed),
		percentageExpense: fromSatang(percentage),
		netTaxable: net,
		brackets: evaluated.brackets,
		tax: evaluated.totalTax,
	}
}
