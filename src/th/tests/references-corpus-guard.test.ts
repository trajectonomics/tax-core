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

	it("finds a dynamic import written with a template string", () => {
		const source = `const engine = await import(\`../calculate\`)`
		const findings = findThCorpusImportViolations(corpus(source))
		expect(findings).toHaveLength(1)
		expect(findings[0]?.specifier).toBe("../calculate")
	})

	it("ignores a commented-out import, a block comment and a template that spells one", () => {
		const source = [
			'// import { calculateThTax } from "../calculate"',
			'/* import { emitThLevy } from "../levy/emit" */',
			'export const note = `from "../calculate"`',
			"const text = `",
			'import { $ } from "../fake"',
			"`",
			"const view = `",
			'import { x } from "../other"',
			"`",
			'import { runThaiCorpusCase } from "./corpus-harness"',
		].join("\n")
		expect(findThCorpusImportViolations(corpus(source))).toEqual([])
	})

	it("finds a default import beside a named or namespace clause", () => {
		const named = 'import name, { calculateThTax } from "../calculate"'
		const namespace = 'import name, * as ns from "../calculate"'
		expect(findThCorpusImportViolations(corpus(named))[0]?.specifier).toBe("../calculate")
		expect(findThCorpusImportViolations(corpus(namespace))[0]?.specifier).toBe("../calculate")
	})

	it("finds a second import after a semicolon and an import with from on its own line", () => {
		const sameLine = 'import { it } from "bun:test"; import { calculateThTax } from "../calculate"'
		expect(findThCorpusImportViolations(corpus(sameLine))).toHaveLength(1)
		const wrapped = 'import name\nfrom "../calculate"'
		expect(findThCorpusImportViolations(corpus(wrapped))[0]?.specifier).toBe("../calculate")
	})

	it("finds a require call", () => {
		const source = 'const engine = require("../calculate")'
		expect(findThCorpusImportViolations(corpus(source))[0]?.specifier).toBe("../calculate")
	})

	it("does not flag a commented-out dynamic import", () => {
		const source = ['/* import("../calculate") */', 'import { it } from "bun:test"'].join("\n")
		expect(findThCorpusImportViolations(corpus(source))).toEqual([])
	})

	it("does not let a comment hide the real specifier of a wrapped import", () => {
		const source = [
			"import {",
			"\tcalculateThTax,",
			'} from /* from "bun:test" */ "../calculate"',
		].join("\n")
		const findings = findThCorpusImportViolations(corpus(source))
		expect(findings).toHaveLength(1)
		expect(findings[0]?.line).toBe(1)
		expect(findings[0]?.specifier).toBe("../calculate")
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
