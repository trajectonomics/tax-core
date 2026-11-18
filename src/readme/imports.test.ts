import { describe, expect, it } from "bun:test"
import { parseExampleImports } from "./imports"

describe("parseExampleImports", () => {
	it("reads a named import list with an alias and a type modifier", () => {
		const source = 'import { calculateThTax, type ThTaxInput, th as thSystem } from "mod"'
		expect(parseExampleImports(source)).toEqual([
			{ specifier: "mod", names: ["calculateThTax", "ThTaxInput", "th"], line: 1 },
		])
	})

	it("reads a type-only import", () => {
		const source = 'import type { ThLevyProfile } from "@trajectonomics/tax/th"'
		expect(parseExampleImports(source)).toEqual([
			{ specifier: "@trajectonomics/tax/th", names: ["ThLevyProfile"], line: 1 },
		])
	})

	it("reads a default import and a default plus named import", () => {
		const source = 'import tax from "a"\nimport other, { money } from "b"'
		expect(parseExampleImports(source)).toEqual([
			{ specifier: "a", names: ["default"], line: 1 },
			{ specifier: "b", names: ["default", "money"], line: 2 },
		])
	})

	it("reads a bare side-effect import with no names", () => {
		expect(parseExampleImports('import "./setup"')).toEqual([
			{ specifier: "./setup", names: [], line: 1 },
		])
	})

	it("reads a namespace import with no names to check", () => {
		expect(parseExampleImports('import * as th from "mod"')).toEqual([
			{ specifier: "mod", names: [], line: 1 },
		])
	})

	it("carries the line number of a later import", () => {
		const source = 'const a = 1\n\nimport { money } from "mod"\n'
		expect(parseExampleImports(source)).toEqual([{ specifier: "mod", names: ["money"], line: 3 }])
	})

	it("ignores text that is not an import declaration", () => {
		expect(parseExampleImports("const x = 'import { a } from \"mod\"'")).toEqual([])
	})
})
