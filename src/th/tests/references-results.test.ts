import { describe, expect, it } from "bun:test"
import { isThSourceResult, TH_SOURCE_RESULTS } from "../references/results"

describe("TH_SOURCE_RESULTS", () => {
	it("keeps the documented vocabulary in order", () => {
		expect(TH_SOURCE_RESULTS).toEqual(["match", "derived", "reported", "unsourced", "fixed"])
	})

	it("recognizes a documented result and rejects anything else", () => {
		expect(isThSourceResult("reported")).toBe(true)
		expect(isThSourceResult("unsourced")).toBe(true)
		expect(isThSourceResult("probably")).toBe(false)
		expect(isThSourceResult("")).toBe(false)
	})
})
