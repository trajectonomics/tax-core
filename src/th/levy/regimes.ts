import { rateFraction } from "../../core/money/ratio"
import { TH_2026_PARAMETERS } from "../parameters"
import { ThFinalWithholdingElection } from "../types"
import { validateCorpTaxRate } from "../validate"
import type { ThLevyGraph } from "./graph"
import { sumMeasures } from "./graph-rates"
import { ThLevyRounding } from "./graph-types"
import { ThLevyIncomeLabel } from "./labels"
import { ThLevyMeasureId } from "./measure-ids"
import type { ThLevySection40_4Elections } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Section 40(4) Measures: included income, final withholding tax, and the Section 47 bis credit.
 *
 * Purpose: Names every output of the Section 40(4) election split.
 * Math: No arithmetic; ids only.
 * Units: The referenced Measures are integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40(4), 47 bis, 50(2)(g), 57 ter.
 */
export interface ThSection40_4Measures {
	/** Included sources plus the dividend gross-up, added to Section 40(4) assessable income. */
	readonly assessable: string
	/** Tax withheld at source on sources elected final. */
	readonly finalWithholdingTax: string
	/** Section 47 bis credit for included dividends, or zero. */
	readonly dividendCredit: string
}

function withheld(graph: ThLevyGraph, tally: string, rate: number): string {
	const { num, den } = rateFraction(rate)
	return graph.scale(tally, num, den, ThLevyRounding.HalfUp)
}

/**
 * Emits the Section 40(4) split: sources elected final leave regular brackets and carry their
 * withholding tax; included sources join Section 40(4) income, and included dividends also earn
 * the Section 47 bis gross-up credit.
 *
 * Purpose: Applies each source's emit-time election and builds the Section 47 bis credit.
 * Math: Final tax = `round_half_up(amount * rate)`; credit = `round_half_up(dividend * r / (1-r))`;
 * assessable = sum of included sources + credit.
 * Units: Integer satang Measures; rates are dimensionless.
 * Throws: TaxValidationError if the corporate tax rate is outside [0, 1).
 *
 * @param graph Measure graph being built.
 * @param tallies Income tally ids.
 * @param elections Final-withholding and Section 47 bis elections fixed at emit time.
 * @statute Thailand Revenue Code Sections 40(4), 47 bis, 50(2)(g), 57 ter.
 */
export function addSection40_4(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	elections: ThLevySection40_4Elections = {},
): ThSection40_4Measures {
	const rates = TH_2026_PARAMETERS.finalWithholding
	const income = tallies.income
	const corpTaxRate = elections.dividendCorpTaxRate
	if (corpTaxRate !== undefined) validateCorpTaxRate(corpTaxRate)
	const isFinal = (election: ThFinalWithholdingElection | undefined): boolean =>
		election === ThFinalWithholdingElection.Final
	const included = [income[ThLevyIncomeLabel.Section40_4Other]]
	const finalTaxes: string[] = []
	const interest = income[ThLevyIncomeLabel.Section40_4Interest]
	if (isFinal(elections.interest)) finalTaxes.push(withheld(graph, interest, rates.interestRate))
	else included.push(interest)
	const dividend = income[ThLevyIncomeLabel.Section40_4Dividends]
	const isDividendIncluded = !isFinal(elections.dividends)
	if (isDividendIncluded) included.push(dividend)
	else finalTaxes.push(withheld(graph, dividend, rates.dividendRate))
	const digital = income[ThLevyIncomeLabel.Section40_4DigitalAssets]
	if (isFinal(elections.digitalAssets))
		finalTaxes.push(withheld(graph, digital, rates.digitalAssetRate))
	else included.push(digital)
	let credit: string
	if (isDividendIncluded && corpTaxRate !== undefined) {
		const { num, den } = rateFraction(corpTaxRate)
		credit = graph.scale(
			dividend,
			num,
			den - num,
			ThLevyRounding.HalfUp,
			ThLevyMeasureId.DividendCredit,
		)
		included.push(credit)
	} else {
		credit = graph.constant(0, ThLevyMeasureId.DividendCredit)
	}
	const assessable = sumMeasures(graph, included)
	const finalWithholdingTax = sumMeasures(graph, finalTaxes, ThLevyMeasureId.FinalWithholdingTax)
	return { assessable, finalWithholdingTax, dividendCredit: credit }
}
