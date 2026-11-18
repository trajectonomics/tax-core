import { describe, expect, it } from "bun:test"
import { findReadmeDrift } from "./findings"

const exports = {
	root: new Set(["money"]),
	th: new Set(["calculateThTax", "emitThLevy"]),
	us: new Set(["calculateUsTax"]),
}

describe("findReadmeDrift", () => {
	it("reports a claim-shaped name that no entry point exports", () => {
		const findings = findReadmeDrift("exports `ThLevyGhost`", exports)
		expect(findings).toEqual([
			{ line: 1, message: "`ThLevyGhost` is not exported by any entry point" },
		])
	})

	it("accepts a claim that any one entry point exports", () => {
		expect(findReadmeDrift("`emitThLevy`, `money`, `calculateUsTax`", exports)).toEqual([])
	})

	it("reports an example importing a name its subpath does not export", () => {
		const readme = ["```ts", 'import { emitThLevy } from "@trajectonomics/tax"', "```"].join("\n")
		expect(findReadmeDrift(readme, exports)).toEqual([
			{ line: 2, message: '`emitThLevy` is not exported by "@trajectonomics/tax"' },
		])
	})

	it("accepts an example importing the name its subpath exports", () => {
		const readme = ["```ts", 'import { calculateThTax } from "@trajectonomics/tax/th"', "```"].join(
			"\n",
		)
		expect(findReadmeDrift(readme, exports)).toEqual([])
	})

	it("checks no name for an import outside the entry points", () => {
		const readme = ["```ts", 'import { anything } from "some-other-package"', "```"].join("\n")
		expect(findReadmeDrift(readme, exports)).toEqual([])
	})

	it("reports a release marker that carries a prerelease tag", () => {
		const findings = findReadmeDrift("## Levy\n\n> **Ships in 0.2.0-alpha.7.**", exports)
		expect(findings).toHaveLength(1)
		expect(findings[0]?.line).toBe(3)
	})

	it("orders findings by README line", () => {
		const readme = ["`ThLevyGhost`", "", "## Levy", "> **Ships in 0.2.0-beta.1.**"].join("\n")
		expect(findReadmeDrift(readme, exports).map((finding) => finding.line)).toEqual([1, 4])
	})

	it("finds nothing wrong in the repository's README", () => {
		expect(
			findReadmeDrift("Pure engine.\n\n## Install\n\n```bash\nbun add pkg\n```\n", exports),
		).toEqual([])
	})
})
