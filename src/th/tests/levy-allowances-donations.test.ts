import { describe, expect, it } from "bun:test"
import { addDonationAllowances } from "../levy/allowances-donations"
import { ThLevyMeasureId } from "../levy/measure-ids"
import { calculateDonationAllowances } from "../stages/allowances-donations"
import { toSatang } from "../units"
import { runLevy } from "./levy-build"
import { major, satangOf } from "./levy-satang"

function donations(
	netBefore: number,
	twoX: number | undefined,
	oneX: number | undefined,
): { total: number; netTaxable: number } {
	const values = runLevy(new Map(), new Map(), (graph) => {
		const net = graph.constant(netBefore)
		return addDonationAllowances(graph, net, twoX, oneX).netTaxable
	}).values
	return {
		total: values.get(ThLevyMeasureId.Donations) ?? Number.NaN,
		netTaxable: values.get(ThLevyMeasureId.NetTaxableIncome) ?? Number.NaN,
	}
}

function expected(netBefore: number, twoX: number | undefined, oneX: number | undefined) {
	const stage = calculateDonationAllowances(twoX, oneX, major(netBefore))
	return {
		total: satangOf(stage.allowedDonationsTotal),
		netTaxable: satangOf(stage.netTaxableIncome),
	}
}

describe("TH 2026 Levy donation allowances", () => {
	it("doubles 2x donations, caps them at 10% of net, then caps 1x at 10% of the rest", () => {
		expect(donations(toSatang(840_000), 50_000, 100_000)).toEqual({
			total: toSatang(84_000 + 75_600),
			netTaxable: toSatang(840_000 - 84_000 - 75_600),
		})
		expect(donations(toSatang(840_000), 50_000, 100_000)).toEqual(
			expected(toSatang(840_000), 50_000, 100_000),
		)
	})

	it("keeps taxable income at zero when donations exceed the net", () => {
		expect(donations(0, 100_000, 100_000)).toEqual({ total: 0, netTaxable: 0 })
		expect(donations(0, 100_000, 100_000)).toEqual(expected(0, 100_000, 100_000))
	})

	it("rounds the 10% caps down to whole baht", () => {
		const net = toSatang(100_009)
		expect(donations(net, 100_000, 0)).toEqual(expected(net, 100_000, 0))
		expect(donations(net, 100_000, 0).total).toBe(toSatang(10_000))
	})
})
