import { describe, expect, it } from "bun:test"
import type { Levy, Tallies } from "@trajectonomics/sim"
import { evaluateMeasures } from "@trajectonomics/sim"
import { TaxValidationError } from "../../core/money"
import { ThLevyGraph } from "../levy/graph"
import {
	capAt,
	flooredToBaht,
	rateCapAt,
	rateFlooredToBaht,
	sumMeasures,
} from "../levy/graph-rates"
import { ThLevyRounding, ThLevyTallyBasis } from "../levy/graph-types"
import { ThLevyMeasureId } from "../levy/measure-ids"
import { levyValues, simTallies } from "./levy-sim"

const CONTEXT = { date: "2026-12-31", inflation: 0 }

function emptyTallies(gross: ReadonlyArray<readonly [string, number]> = []): Tallies {
	return { gross: new Map(gross), funded: new Map() }
}

function measureValue(levy: Levy, id: string, tallies: Tallies = emptyTallies()): number {
	const result = evaluateMeasures(levy, tallies, CONTEXT)
	if (!result.ok) throw new Error(`evaluation failed: ${JSON.stringify(result.problem)}`)
	const value = result.values.get(id)
	if (value === undefined) throw new Error(`missing measure ${id}`)
	return value
}

function build(graph: ThLevyGraph, due: string): Levy {
	return graph.build("test", { month: 1, day: 1 }, { month: 3, day: 31 }, due)
}

describe("ThLevyGraph measures", () => {
	it("emits only the closed sim-core operation set with deterministic auto ids", () => {
		const graph = new ThLevyGraph()
		const a = graph.tally("income.section40_1", ThLevyTallyBasis.Gross)
		const b = graph.constant(100)
		expect(a).toBe("auto.0")
		expect(b).toBe("auto.1")
		const levy = build(graph, a)
		expect(levy.measures.map((measure) => measure.op)).toEqual(["tally", "const"])
		expect(new Set(levy.measures.map((m) => m.id)).size).toBe(levy.measures.length)
	})

	it("evaluates binary, scale and pick operands exactly", () => {
		const graph = new ThLevyGraph()
		const a = graph.constant(1000)
		const b = graph.constant(250)
		const sum = graph.add(a, b)
		const difference = graph.sub(a, b)
		const capped = graph.min(a, b)
		const atLeast = graph.max(a, b)
		const half = graph.scale(a, 15, 100, ThLevyRounding.HalfUp)
		const chosen = graph.pick(a, b, a, b)
		const levy = build(graph, sum)
		expect(measureValue(levy, sum)).toBe(1250)
		expect(measureValue(levy, difference)).toBe(750)
		expect(measureValue(levy, capped)).toBe(250)
		expect(measureValue(levy, atLeast)).toBe(1000)
		expect(measureValue(levy, half)).toBe(150)
		expect(measureValue(levy, chosen)).toBe(1000)
	})

	it("reads tallies per basis and treats a missing label as zero", () => {
		const graph = new ThLevyGraph()
		const present = graph.tally("income.section40_1", ThLevyTallyBasis.Gross)
		const missing = graph.tally("income.section40_2", ThLevyTallyBasis.Gross)
		const levy = build(graph, present)
		const tallies = emptyTallies([["income.section40_1", 42]])
		expect(measureValue(levy, present, tallies)).toBe(42)
		expect(measureValue(levy, missing, tallies)).toBe(0)
	})

	it("floors a percentage to whole baht the way Math.floor(major * rate) does", () => {
		const graph = new ThLevyGraph()
		const base = graph.tally("base", ThLevyTallyBasis.Gross)
		const half = rateFlooredToBaht(graph, base, 0.5)
		const whole = flooredToBaht(graph, base)
		const levy = build(graph, half)
		const tallies = emptyTallies([["base", 10_001]])
		expect(measureValue(levy, half, tallies)).toBe(5000)
		expect(measureValue(levy, whole, tallies)).toBe(10_000)
	})

	it("caps a percentage at a satang ceiling with half-up rounding", () => {
		const graph = new ThLevyGraph()
		const base = graph.tally("base", ThLevyTallyBasis.Gross)
		const capped = rateCapAt(graph, base, 0.3, 500_000)
		const tight = rateCapAt(graph, base, 0.3, 2000)
		const absolute = capAt(graph, base, 9000)
		const levy = build(graph, capped)
		const tallies = emptyTallies([["base", 10_001]])
		expect(measureValue(levy, capped, tallies)).toBe(3000)
		expect(measureValue(levy, tight, tallies)).toBe(2000)
		expect(measureValue(levy, absolute, tallies)).toBe(9000)
	})

	it("sums measures and folds an empty list to zero", () => {
		const graph = new ThLevyGraph()
		const a = graph.constant(10)
		const b = graph.constant(32)
		const total = sumMeasures(graph, [a, b])
		const empty = sumMeasures(graph, [])
		const levy = build(graph, total)
		expect(measureValue(levy, total)).toBe(42)
		expect(measureValue(levy, empty)).toBe(0)
	})

	it("names audited measures and rejects a due that was never emitted", () => {
		const graph = new ThLevyGraph()
		graph.constant(1, ThLevyMeasureId.NetTaxPayable)
		expect(build(graph, ThLevyMeasureId.NetTaxPayable).due).toBe("tax.net_payable")
		expect(() => build(graph, "missing")).toThrow(TaxValidationError)
	})
})

describe("ThLevyGraph invariants", () => {
	it("rejects duplicate ids", () => {
		const graph = new ThLevyGraph()
		graph.constant(1, "id")
		expect(() => graph.constant(2, "id")).toThrow(TaxValidationError)
	})

	it("rejects a const that is not safe integer satang", () => {
		expect(() => new ThLevyGraph().constant(1.5)).toThrow(TaxValidationError)
	})

	it("rejects an invalid scale fraction", () => {
		const graph = new ThLevyGraph()
		const of = graph.constant(1)
		expect(() => graph.scale(of, 1.5, 100, ThLevyRounding.Floor)).toThrow(TaxValidationError)
		expect(() => graph.scale(of, 1, 0, ThLevyRounding.Floor)).toThrow(TaxValidationError)
	})

	it("reports an evaluator problem for an unsafe tally instead of values", () => {
		const graph = new ThLevyGraph()
		const tally = graph.tally("unsafe", ThLevyTallyBasis.Gross)
		const levy = build(graph, tally)
		const unsafe = simTallies(new Map([["unsafe", Number.MAX_SAFE_INTEGER + 2]]))
		expect(() => levyValues(levy, unsafe)).toThrow()
	})

	it("rejects an operand that was never emitted", () => {
		const graph = new ThLevyGraph()
		const a = graph.constant(1)
		graph.add(a, "ghost")
		expect(() => build(graph, a)).toThrow(TaxValidationError)
	})
})
