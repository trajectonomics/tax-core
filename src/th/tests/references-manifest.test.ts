import { describe, expect, it } from "bun:test"
import { parseThSourceManifest, TH_SOURCE_MARKER } from "../references/manifest"

const header =
	"| Parameter path | Figure | Citation | Document | Read | Result |\n| --- | --- | --- | --- | --- | --- |"
const row = (path: string, result: string) => `| \`${path}\` | 1 | s | u | 2026-11-17 | ${result} |`
const document = (rows: string) => `${TH_SOURCE_MARKER}\n\n${header}\n${rows}\n`

describe("parseThSourceManifest", () => {
	it("parses rows after the marker, skipping the header and separator", () => {
		const parsed = parseThSourceManifest(
			document(`${row("allowances.personal", "match")}\n${row("brackets[*].rate", "derived")}`),
		)
		expect(parsed.issues).toEqual([])
		expect(parsed.rows).toEqual([
			{ path: "allowances.personal", result: "match", line: 5 },
			{ path: "brackets[*].rate", result: "derived", line: 6 },
		])
	})

	it("reports a missing marker instead of parsing preamble tables", () => {
		const parsed = parseThSourceManifest("| `not.a.row` | 1 | s | u | 2026-11-17 | match |")
		expect(parsed.rows).toEqual([])
		expect(parsed.issues[0]?.line).toBe(0)
		expect(parsed.issues[0]?.message).toContain("missing marker")
	})

	it("stops at the next level-two heading", () => {
		const body = `${TH_SOURCE_MARKER}\n\n${header}\n${row("a.b", "match")}\n\n## Next\n${row("c.d", "match")}`
		const parsed = parseThSourceManifest(body)
		expect(parsed.rows.map((entry) => entry.path)).toEqual(["a.b"])
	})

	it("stops at the first non-table line after a row", () => {
		const body = `${TH_SOURCE_MARKER}\n\n${header}\n${row("a.b", "match")}\nTrailing prose`
		expect(parseThSourceManifest(body).rows).toHaveLength(1)
	})

	it("carries a rejected row's line number into the issues", () => {
		const parsed = parseThSourceManifest(document(`${row("a.b", "match")}\n| broken |`))
		expect(parsed.rows).toHaveLength(1)
		expect(parsed.issues[0]?.line).toBe(6)
	})
})
