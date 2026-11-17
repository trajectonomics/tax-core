import { describe, expect, it } from "bun:test"
import {
	findThCorpusImportViolations,
	isThCorpusFile,
	TH_CORPUS_IMPORT_ALLOWLIST,
} from "../references/corpus-guard"

const corpus = (source: string) => [{ file: "src/th/tests/corpus-regular.test.ts", source }]

describe("isThCorpusFile", () => {
	it("accepts a corpus family file and rejects the harness and other suites", () => {
		expect(isThCorpusFile("corpus-regular.test.ts")).toBe(true)
		expect(isThCorpusFile("src/th/tests/corpus-separate-sheet.test.ts")).toBe(true)
		expect(isThCorpusFile("corpus-harness.ts")).toBe(false)
		expect(isThCorpusFile("levy-corpus.test.ts")).toBe(false)
		expect(isThCorpusFile("pipeline-integration.test.ts")).toBe(false)
	})
})

describe("findThCorpusImportViolations", () => {
	it("allows only the test runner, the harness and the money helpers", () => {
		const source = [
			'import { describe, expect, it } from "bun:test"',
			'import { runThaiCorpusCase } from "./corpus-harness"',
			'import { thb } from "../../core/money"',
		].join("\n")
		expect(findThCorpusImportViolations(corpus(source))).toEqual([])
		expect(TH_CORPUS_IMPORT_ALLOWLIST).toEqual(["bun:test", "./corpus-harness", "../../core/money"])
	})

	it("fails a direct import of the calculation entry point", () => {
		const findings = findThCorpusImportViolations(
			corpus('import { calculateThTax } from "../calculate"'),
		)
		expect(findings).toEqual([
			{ file: "src/th/tests/corpus-regular.test.ts", line: 1, specifier: "../calculate" },
		])
	})

	it("fails a type import, a re-export and a side-effect import", () => {
		const source = [
			'import type { ThTaxInput } from "../types"',
			'export { runThaiCorpusCase } from "../calculate"',
			'import "../parameters"',
		].join("\n")
		expect(findThCorpusImportViolations(corpus(source)).map((finding) => finding.line)).toEqual([
			1, 2, 3,
		])
	})

	it("ignores a file that is not a corpus family file", () => {
		const findings = findThCorpusImportViolations([
			{
				file: "src/th/tests/special-regimes-integration.test.ts",
				source: 'import { x } from "../calculate"',
			},
		])
		expect(findings).toEqual([])
	})

	it("finds an import Biome wrapped across lines, at the line it starts on", () => {
		const source = [
			"const before = 1",
			"import {",
			"\tcalculateThTax",
			'} from "../calculate"',
		].join("\n")
		expect(findThCorpusImportViolations(corpus(source))).toEqual([
			{ file: "src/th/tests/corpus-regular.test.ts", line: 2, specifier: "../calculate" },
		])
	})

	it("finds a dynamic import of the engine", () => {
		const source = 'const engine = await import("../calculate")'
		expect(findThCorpusImportViolations(corpus(source))).toEqual([
			{ file: "src/th/tests/corpus-regular.test.ts", line: 1, specifier: "../calculate" },
		])
	})

	it("reports the file name and line of every violation", () => {
		const findings = findThCorpusImportViolations([
			{ file: "corpus-combined.test.ts", source: '\n\nimport { emitThLevy } from "../levy/emit"' },
		])
		expect(findings).toEqual([
			{ file: "corpus-combined.test.ts", line: 3, specifier: "../levy/emit" },
		])
	})
})
