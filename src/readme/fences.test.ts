import { describe, expect, it } from "bun:test"
import { parseReadmeFences } from "./fences"

describe("parseReadmeFences", () => {
	it("reads a fenced block with its language and 1-based opening line", () => {
		const fences = parseReadmeFences("intro\n\n```ts\nconst a = 1\n```\n")
		expect(fences).toEqual([{ language: "ts", line: 3, content: "const a = 1" }])
	})

	it("reads a fence with no language as an empty language", () => {
		const fences = parseReadmeFences("```\nplain\n```")
		expect(fences).toEqual([{ language: "", line: 1, content: "plain" }])
	})

	it("reads an unterminated fence to the end of the document", () => {
		const fences = parseReadmeFences("```ts\nconst a = 1\n\nmore")
		expect(fences).toEqual([{ language: "ts", line: 1, content: "const a = 1\n\nmore" }])
	})

	it("strips the opener's indentation from an indented fence in a list item", () => {
		const fences = parseReadmeFences("- item\n\n  ```ts\n  const a = 1\n  ```\n")
		expect(fences).toEqual([{ language: "ts", line: 3, content: "const a = 1" }])
	})

	it("does not open a fence on a blockquote line", () => {
		expect(parseReadmeFences("> ```ts\n> not code\n> ```")).toEqual([])
	})

	it("keeps a blockquote line inside a fence as content", () => {
		const fences = parseReadmeFences("```text\n> **Ships in 0.2.0.**\n```")
		expect(fences[0]?.content).toBe("> **Ships in 0.2.0.**")
	})

	it("reads fences opened with tildes, and requires a matching run to close", () => {
		const fences = parseReadmeFences("~~~bash\necho hi\n````\nstill inside\n~~~")
		expect(fences).toEqual([{ language: "bash", line: 1, content: "echo hi\n````\nstill inside" }])
	})

	it("ignores a backtick run too short to close the fence", () => {
		const fences = parseReadmeFences("````ts\ncode\n```\nstill\n````")
		expect(fences[0]?.content).toBe("code\n```\nstill")
	})

	it("returns no fences for an empty document", () => {
		expect(parseReadmeFences("")).toEqual([])
	})
})
