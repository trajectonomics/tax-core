import { describe, expect, it } from "bun:test"
import { readmeExamples, runFindings, typecheckFindings } from "./examples"
import type { ReadmeFence } from "./fences"

const fence = (language: string, line: number, content = ""): ReadmeFence => ({
	language,
	line,
	content,
})

const examples = readmeExamples([
	fence("bash", 1),
	fence("ts", 3),
	fence("text", 9),
	fence("ts", 20),
])

describe("readmeExamples", () => {
	it("keeps only ts fences, with their index among all fences", () => {
		expect(examples.map((example) => example.index)).toEqual([1, 3])
	})

	it("returns nothing when the README has no ts fence", () => {
		expect(readmeExamples([fence("bash", 1)])).toEqual([])
	})
})

describe("typecheckFindings", () => {
	it("maps a diagnostic to the README line of the example it names", () => {
		const output = 'example-1.ts(2,10): error TS2305: no exported member "emitThLevy".'
		expect(typecheckFindings(output, examples, 1)).toEqual([
			{ line: 5, message: 'does not typecheck: error TS2305: no exported member "emitThLevy".' },
		])
	})

	it("reports a diagnostic it cannot map to an example, rather than passing", () => {
		const findings = typecheckFindings("example-9.ts(1,1): error TS1000: unknown.", examples, 1)
		expect(findings).toHaveLength(1)
		expect(findings[0]?.line).toBe(3)
		expect(findings[0]?.message).toContain("error TS1000")
	})

	it("reports a failure that carries no file diagnostic", () => {
		const findings = typecheckFindings("tsconfig is broken", examples, 1)
		expect(findings).toHaveLength(1)
		expect(findings[0]?.message).toContain("tsconfig is broken")
	})

	it("reports nothing when tsc succeeded", () => {
		expect(typecheckFindings("", examples, 0)).toEqual([])
	})
})

describe("runFindings", () => {
	const example = examples[0]!

	it("reports the example's line when it exits non-zero", () => {
		const findings = runFindings(
			{ example, status: 1, stdout: "", stderr: "Error: bad input" },
			undefined,
		)
		expect(findings).toEqual([{ line: 3, message: "example exited 1: Error: bad input" }])
	})

	it("reports the text fence when stdout differs from it", () => {
		const findings = runFindings(
			{ example, status: 0, stdout: "THB 1\n", stderr: "" },
			fence("text", 9, "THB 2"),
		)
		expect(findings).toEqual([
			{ line: 9, message: 'text fence does not match the example\'s stdout: "THB 1"' },
		])
	})

	it("accepts stdout that matches the text fence with trailing newlines trimmed", () => {
		const run = { example, status: 0, stdout: "THB 1\n\n", stderr: "" }
		expect(runFindings(run, fence("text", 9, "THB 1\n"))).toEqual([])
	})

	it("reports nothing when no text fence follows the example", () => {
		expect(runFindings({ example, status: 0, stdout: "anything", stderr: "" }, undefined)).toEqual(
			[],
		)
	})

	it("reports nothing when the next fence is not a text fence", () => {
		const run = { example, status: 0, stdout: "anything", stderr: "" }
		expect(runFindings(run, fence("bash", 9))).toEqual([])
	})
})
