import { describe, expect, it } from "bun:test"
import { parseDeclarationExports } from "./declarations"

describe("parseDeclarationExports", () => {
	it("reads an exported declaration", () => {
		const source = [
			"export declare function calculateThTax(input?: ThTaxInput): TaxResult;",
			"export declare const TH_2026_PARAMETERS: ThParameters;",
			"export declare class TaxValidationError extends Error {}",
		].join("\n")
		expect(parseDeclarationExports(source)).toEqual([
			"calculateThTax",
			"TH_2026_PARAMETERS",
			"TaxValidationError",
		])
	})

	it("reads an exported type alias written without declare", () => {
		expect(parseDeclarationExports("export type ThLevyIncomeLabel = string;")).toEqual([
			"ThLevyIncomeLabel",
		])
	})

	it("reads an export clause, dropping type modifiers and folding aliases", () => {
		const source = "export { type BracketSlice, UsPayrollField as UsFicaField, money, usd };"
		expect(parseDeclarationExports(source)).toEqual(["BracketSlice", "UsFicaField", "money", "usd"])
	})

	it("reads an export clause written across several lines", () => {
		const source = "export {\n\ttype A,\n\tb as c,\n};"
		expect(parseDeclarationExports(source)).toEqual(["A", "c"])
	})

	it("ignores non-exported declarations and re-export stars", () => {
		const source = 'declare const internal: number;\nexport * from "./other";'
		expect(parseDeclarationExports(source)).toEqual([])
	})

	it("returns each name once when a value is declared and re-exported", () => {
		const source = "export declare function money(): void;\nexport { money };"
		expect(parseDeclarationExports(source)).toEqual(["money"])
	})

	it("returns nothing for an empty declaration file", () => {
		expect(parseDeclarationExports("")).toEqual([])
	})
})
