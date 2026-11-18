import { describe, expect, it } from "bun:test"
import { extractReadmeClaims } from "./claims"

describe("extractReadmeClaims", () => {
	it("takes the identifier out of a backticked call", () => {
		expect(extractReadmeClaims("exports `emitThLevy(profile)`, which")).toEqual([
			{ name: "emitThLevy", line: 1 },
		])
	})

	it("reads only the API name from a backticked expression", () => {
		const claims = extractReadmeClaims("`calculateThTax(...).netTaxPayable` is the total")
		expect(claims.map((claim) => claim.name)).toEqual(["calculateThTax"])
	})

	it("reads every claim-shaped pattern from prose", () => {
		const readme = "`ThLevyIncomeLabel`, `TH_2026_PARAMETERS`, `calculateUsTax`, `TaxResult`"
		expect(extractReadmeClaims(readme).map((claim) => claim.name)).toEqual([
			"ThLevyIncomeLabel",
			"TH_2026_PARAMETERS",
			"calculateUsTax",
			"TaxResult",
		])
	})

	it("finds no claim in a table of label strings or a plain field name", () => {
		const readme = "| `income.section40_1` | Section 40(1) employment |\n`breakdown` and `money`"
		expect(extractReadmeClaims(readme)).toEqual([])
	})

	it("ignores a blockquote line", () => {
		expect(extractReadmeClaims("> **Ships in 0.2.0.** The `ThLevyGap` export")).toEqual([])
	})

	it("ignores backticked text inside a fence", () => {
		expect(extractReadmeClaims("```ts\nconst label = `ThLevyGap`\n```")).toEqual([])
	})

	it("ignores an unmatched backtick run", () => {
		expect(extractReadmeClaims("a lone ` backtick and `ThLevyGap` after it")).toEqual([])
	})

	it("keeps pairing in step across runs of different lengths on one line", () => {
		expect(extractReadmeClaims("``a `ThLevyGap` b`` and `ThLevyMeasureId`")).toEqual([
			{ name: "ThLevyGap", line: 1 },
			{ name: "ThLevyMeasureId", line: 1 },
		])
	})

	it("carries the line number of the claim", () => {
		expect(extractReadmeClaims("line one\n\nThe `emitThLevy` export")).toEqual([
			{ name: "emitThLevy", line: 3 },
		])
	})
})
