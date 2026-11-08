import { describe, expect, it } from "bun:test"
import type { Levy, Scenario } from "@trajectonomics/sim"
import { check } from "@trajectonomics/sim"
import { TaxValidationError } from "../../core/money"
import { emitThLevy } from "../levy/emit"
import { ThLevyIncomeLabel } from "../levy/labels"
import { ThLevyMeasureId } from "../levy/measure-ids"
import type { ThLevyProfile } from "../levy/profile-types"
import { toSatang } from "../units"
import { levyValues, simTallies } from "./levy-sim"

const ALLOWED_OPS = ["const", "tally", "add", "sub", "min", "max", "scale", "pick"]
const BASELINE = { schemaVersion: 1, balances: [] }
const TIMELINE = { start: "2026-01-01", horizon: "2026-12-31", resolution: "month" }

function scenario(levy: Levy): Scenario {
	return {
		schemaVersion: 2,
		currency: "THB",
		economy: { inflation: 0 },
		accounts: [{ id: "cash", kind: "asset", rate: 0 }],
		flows: [],
		cashflow: { surplus: [{ account: "cash" }], contribute: [], withdraw: [] },
		levy: {
			...levy,
			carryIn: [{ periodStart: "2025-01-01", tallies: [], prepaid: 0 }],
		},
	}
}

function dueOf(profile: ThLevyProfile, income: Array<[string, number]>): number {
	const levy = emitThLevy(profile)
	const values = levyValues(levy, simTallies(new Map(income)))
	return values.get(levy.due) ?? Number.NaN
}

describe("emitThLevy", () => {
	it("emits a Levy sim-core accepts, using only its closed operation set", () => {
		const levy: Levy = emitThLevy()
		expect(check(BASELINE, scenario(levy), TIMELINE)).toEqual([])
		expect(new Set<string>(levy.measures.map((measure) => measure.op))).toEqual(
			new Set<string>(ALLOWED_OPS),
		)
		expect(new Set(levy.measures.map((measure) => measure.id)).size).toBe(levy.measures.length)
	})

	it("defaults to the 2026 calendar tax year settled on 31 March", () => {
		const levy = emitThLevy()
		expect(levy.id).toBe("th-2026-pit")
		expect(levy.period).toEqual({ month: 1, day: 1 })
		expect(levy.settlement).toEqual({ month: 3, day: 31 })
		expect(levy.due).toBe(ThLevyMeasureId.NetTaxPayable)
	})

	it("freezes a caller-supplied Levy identity", () => {
		const levy = emitThLevy({
			levy: { id: "custom", period: { month: 2, day: 1 }, settlement: { month: 4, day: 30 } },
		})
		expect(levy.id).toBe("custom")
		expect(levy.period).toEqual({ month: 2, day: 1 })
		expect(levy.settlement).toEqual({ month: 4, day: 30 })
	})

	it("computes a hand-worked liability of 21,500 THB on a 600,000 THB salary", () => {
		const due = dueOf({}, [[ThLevyIncomeLabel.Section40_1, toSatang(600_000)]])
		expect(due).toBe(toSatang(21_500))
	})

	it("applies the Section 48(2) minimum gross tax when it exceeds progressive tax", () => {
		const profile: ThLevyProfile = {
			expenses: { section40_8: { general: { election: "actual", actualExpense: 6_000_000 } } },
		}
		const due = dueOf(profile, [[ThLevyIncomeLabel.Section40_8General, toSatang(6_000_000)]])
		expect(due).toBe(toSatang(30_000))
	})

	it("credits Section 47 bis dividends against the amount owed", () => {
		const profile: ThLevyProfile = { section40_4: { dividendCorpTaxRate: 0.2 } }
		const due = dueOf(profile, [
			[ThLevyIncomeLabel.Section40_1, toSatang(600_000)],
			[ThLevyIncomeLabel.Section40_4Dividends, toSatang(100_000)],
		])
		expect(due).toBe(toSatang(12_250))
	})

	it("reports final withholding tax in total tax but not in the amount owed", () => {
		const profile: ThLevyProfile = { section40_4: { interest: "final" } }
		const levy = emitThLevy(profile)
		const values = levyValues(
			levy,
			simTallies(
				new Map([
					[ThLevyIncomeLabel.Section40_1, toSatang(600_000)],
					[ThLevyIncomeLabel.Section40_4Interest, toSatang(100_000)],
				]),
			),
		)
		expect(values.get(ThLevyMeasureId.TotalTax)).toBe(toSatang(36_500))
		expect(values.get(ThLevyMeasureId.NetTaxPayable)).toBe(toSatang(21_500))
		expect(values.get(ThLevyMeasureId.RegularTax)).toBe(toSatang(21_500))
	})

	it("propagates profile validation failures at emit time", () => {
		expect(() =>
			emitThLevy({
				expenses: { section40_3: { election: "actual", actualExpense: -1 } },
			}),
		).toThrow(TaxValidationError)
		expect(() => emitThLevy({ allowances: { donation2x: -1 } })).toThrow(TaxValidationError)
	})
})
