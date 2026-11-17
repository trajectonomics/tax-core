import { describe, expect, it } from "bun:test"
import { compareThSourceCoverage } from "../references/coverage"
import type { ThSourceManifestRow } from "../references/manifest"

const row = (path: string): ThSourceManifestRow => ({ path, result: "match", line: 1 })

describe("compareThSourceCoverage", () => {
	it("passes when every required path has exactly one row", () => {
		const parameterPaths = ["a.b", "c.d", "taxYear"]
		expect(compareThSourceCoverage(parameterPaths, ["taxYear"], [row("a.b"), row("c.d")])).toEqual(
			[],
		)
	})

	it("reports a parameter with no row", () => {
		expect(compareThSourceCoverage(["a.b", "c.d"], [], [row("a.b")])).toEqual([
			{ path: "c.d", reason: "missing-row" },
		])
	})

	it("reports a row that names no parameter, including a table with an index", () => {
		expect(compareThSourceCoverage(["a.b"], [], [row("a.b"), row("brackets[0].rate")])).toEqual([
			{ path: "brackets[0].rate", reason: "extra-row" },
		])
	})

	it("reports a duplicate row", () => {
		expect(compareThSourceCoverage(["a.b"], [], [row("a.b"), row("a.b")])).toEqual([
			{ path: "a.b", reason: "duplicate-row" },
		])
	})

	it("reports an exemption that no parameter path still matches", () => {
		expect(compareThSourceCoverage(["a.b"], ["currency"], [row("a.b")])).toEqual([
			{ path: "currency", reason: "stale-exemption" },
		])
	})

	it("does not require a row for an exempt path", () => {
		expect(compareThSourceCoverage(["a.b", "taxYear"], ["taxYear"], [row("a.b")])).toEqual([])
	})
})
