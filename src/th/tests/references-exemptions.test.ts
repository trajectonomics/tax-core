import { describe, expect, it } from "bun:test"
import { TH_2026_PARAMETERS } from "../parameters"
import { TH_SOURCE_EXEMPT_PATHS } from "../references/exemptions"
import { collectParameterPaths } from "../references/paths"

describe("TH_SOURCE_EXEMPT_PATHS", () => {
	it("holds only the tax year and the currency code", () => {
		expect([...TH_SOURCE_EXEMPT_PATHS]).toEqual(["currency", "taxYear"])
	})

	it("names paths that still exist in the parameters, so the list cannot rot", () => {
		const paths = collectParameterPaths(TH_2026_PARAMETERS)
		for (const path of TH_SOURCE_EXEMPT_PATHS) {
			expect(paths).toContain(path)
		}
	})

	it("exempts no path that carries a statutory amount", () => {
		expect(TH_SOURCE_EXEMPT_PATHS.some((path) => path.startsWith("allowances."))).toBe(false)
		expect(TH_SOURCE_EXEMPT_PATHS.some((path) => path.startsWith("brackets"))).toBe(false)
	})
})
