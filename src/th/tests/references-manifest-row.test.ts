import { describe, expect, it } from "bun:test"
import { parseManifestRow } from "../references/manifest-row"

const cells = (path: string, read = "2026-11-17", result = "match") => [
	path,
	"1",
	"Section 47",
	"https://example.test",
	read,
	result,
]

describe("parseManifestRow", () => {
	it("accepts a backticked collapsed path, an ISO date and a known result", () => {
		expect(parseManifestRow(cells("`brackets[*].rate`"), 7)).toEqual({
			row: { path: "brackets[*].rate", result: "match", line: 7 },
		})
	})

	it("accepts a note after the result word", () => {
		const parsed = parseManifestRow(
			cells("`a.b`", "2026-11-17", "reported (engine 30, source 15)"),
			2,
		)
		expect("row" in parsed && parsed.row.result).toBe("reported")
	})

	it("rejects a row with the wrong column count", () => {
		const parsed = parseManifestRow(["`a.b`", "1", "s", "u", "match"], 3)
		expect("issue" in parsed && parsed.issue.message).toContain("expected 6 columns")
	})

	it("rejects a path without backticks and an array index", () => {
		const plain = parseManifestRow(cells("brackets[0].rate"), 1)
		expect("issue" in plain && plain.issue.message).toContain("not a collapsed parameter path")
		const bare = parseManifestRow(
			cells("allowances.personal").map((cell, i) => (i === 0 ? "allowances.personal" : cell)),
			2,
		)
		expect("issue" in bare && bare.issue.message).toContain("not a collapsed parameter path")
	})

	it("rejects a read date that is not ISO and a result outside the vocabulary", () => {
		const badDate = parseManifestRow(cells("`a.b`", "17/11/2026"), 4)
		expect("issue" in badDate && badDate.issue.message).toContain("ISO read date")
		const badResult = parseManifestRow(cells("`a.b`", "2026-11-17", "probably"), 5)
		expect("issue" in badResult && badResult.issue.message).toContain("unknown result")
	})
})
