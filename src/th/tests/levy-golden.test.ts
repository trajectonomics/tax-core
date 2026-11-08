import { describe, expect, it } from "bun:test"
import { calculateThTax } from "../calculate"
import { emitThLevy } from "../levy/emit"
import { ThLevyMeasureId } from "../levy/measure-ids"
import { buildCorpus, type ThLevyCase } from "./levy-corpus"
import { thTaxInputFor } from "./levy-input"
import { satangOf, signedSatangOf } from "./levy-satang"
import { levyValues, simTallies } from "./levy-sim"

interface Figures {
	readonly assessable: number
	readonly expenses: number
	readonly allowances: number
	readonly taxable: number
	readonly progressive: number
	readonly minimum: number
	readonly regular: number
	readonly finalTax: number
	readonly credit: number
	readonly totalTax: number
	readonly netPayable: number
}

function expectedOf(testCase: ThLevyCase): Figures {
	const result = calculateThTax(
		thTaxInputFor(testCase.profile, testCase.income, testCase.contributions),
	)
	const breakdown = result.breakdown
	return {
		assessable: satangOf(breakdown.assessableIncome.total),
		expenses: satangOf(breakdown.expenseDeductions.total),
		allowances: satangOf(breakdown.allowances.total),
		taxable: satangOf(breakdown.netTaxableIncome),
		progressive: satangOf(breakdown.progressiveTax),
		minimum: satangOf(breakdown.minimumGrossTax.calculatedTax),
		regular: satangOf(breakdown.regularTax),
		finalTax: satangOf(breakdown.finalWithholding.totalTax),
		credit: satangOf(breakdown.dividendTaxCredit.credit),
		totalTax: satangOf(result.totalTax),
		netPayable: signedSatangOf(result.netTaxPayable),
	}
}

function actualOf(testCase: ThLevyCase): Figures {
	const levy = emitThLevy(testCase.profile)
	const values = levyValues(levy, simTallies(testCase.income, testCase.contributions))
	const value = (id: ThLevyMeasureId): number => values.get(id) ?? Number.NaN
	return {
		assessable: value(ThLevyMeasureId.AssessableTotal),
		expenses: value(ThLevyMeasureId.ExpensesTotal),
		allowances: value(ThLevyMeasureId.AllowancesTotal),
		taxable: value(ThLevyMeasureId.NetTaxableIncome),
		progressive: value(ThLevyMeasureId.ProgressiveTax),
		minimum: value(ThLevyMeasureId.MinimumGrossTax),
		regular: value(ThLevyMeasureId.RegularTax),
		finalTax: value(ThLevyMeasureId.FinalWithholdingTax),
		credit: value(ThLevyMeasureId.DividendCredit),
		totalTax: value(ThLevyMeasureId.TotalTax),
		netPayable: value(ThLevyMeasureId.NetTaxPayable),
	}
}

describe("TH 2026 Levy golden corpus", () => {
	it("generates several thousand deterministic cases", () => {
		const first = buildCorpus()
		expect(first.length).toBeGreaterThan(3000)
		expect(buildCorpus().map((item) => item.name)).toEqual(first.map((item) => item.name))
	})

	it("matches calculate to the satang for every generated case", () => {
		const failures = buildCorpus()
			.map((testCase) => ({
				name: testCase.name,
				expected: expectedOf(testCase),
				actual: actualOf(testCase),
			}))
			.filter((row) => JSON.stringify(row.expected) !== JSON.stringify(row.actual))
		expect(failures.slice(0, 5)).toEqual([])
	})
})
