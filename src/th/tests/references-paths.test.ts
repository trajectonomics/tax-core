import { describe, expect, it } from "bun:test"
import { collectParameterPaths, TH_ARRAY_SEGMENT } from "../references/paths"

describe("collectParameterPaths", () => {
	it("collapses an array of objects to one path per field", () => {
		const paths = collectParameterPaths({
			brackets: [
				{ upTo: 1, rate: 0 },
				{ upTo: 2, rate: 1 },
			],
		})
		expect(paths).toEqual([`brackets${TH_ARRAY_SEGMENT}.rate`, `brackets${TH_ARRAY_SEGMENT}.upTo`])
	})

	it("collapses an array of scalars to one path", () => {
		expect(collectParameterPaths({ table: [1, 2, 3] })).toEqual([`table${TH_ARRAY_SEGMENT}`])
	})

	it("walks nested objects and unique-sorts the result", () => {
		const paths = collectParameterPaths({ b: { rate: 1 }, a: { ceiling: 2, rate: 3 } })
		expect(paths).toEqual(["a.ceiling", "a.rate", "b.rate"])
	})

	it("keeps an item object inside an array as one collapsed table", () => {
		const paths = collectParameterPaths({
			expenseTable: [
				{ minYears: 1, rate: 0.92 },
				{ minYears: 2, rate: 0.84 },
			],
		})
		expect(paths).toEqual([
			`expenseTable${TH_ARRAY_SEGMENT}.minYears`,
			`expenseTable${TH_ARRAY_SEGMENT}.rate`,
		])
	})

	it("records an empty object as no path", () => {
		expect(collectParameterPaths({})).toEqual([])
		expect(collectParameterPaths({ empty: {}, value: "THB" })).toEqual(["value"])
	})

	it("returns a sorted copy, not a shared mutable array", () => {
		const first = collectParameterPaths({ b: 1, a: 2 })
		const second = collectParameterPaths({ b: 1, a: 2 })
		expect(first).toEqual(["a", "b"])
		expect(first).not.toBe(second)
	})
})
