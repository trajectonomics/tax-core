import { describe, expect, it } from "bun:test"
import { findReadmeMarkerIssues } from "./markers"

describe("findReadmeMarkerIssues", () => {
	it("accepts a strict X.Y.Z marker as a section's first line", () => {
		expect(findReadmeMarkerIssues("## Levy\n\n> **Ships in 0.2.0.**\n> Later.\n")).toEqual([])
	})

	it("ignores a section whose first line is not a marker", () => {
		expect(findReadmeMarkerIssues("## Levy\n\nThe `emitThLevy` export.\n")).toEqual([])
	})

	it("rejects a marker that carries a prerelease tag", () => {
		const issues = findReadmeMarkerIssues("## Levy\n\n> **Ships in 0.2.0-alpha.7.**\n")
		expect(issues).toHaveLength(1)
		expect(issues[0]?.line).toBe(3)
		expect(issues[0]?.message).toContain("0.2.0-alpha.7")
	})

	it("rejects a marker that is not a version at all", () => {
		const issues = findReadmeMarkerIssues("## Levy\n\n> **Ships in next.**\n")
		expect(issues[0]?.line).toBe(3)
	})

	it("ignores a marker that is not the section's first line", () => {
		expect(
			findReadmeMarkerIssues("## Levy\n\nA sentence.\n\n> **Ships in 0.2.0-alpha.1.**\n"),
		).toEqual([])
	})

	it("treats a level-three heading as part of its level-two section", () => {
		const readme = "## A\n\n> **Ships in 10.0.0.**\n\n### B\n\n> **Ships in bad.**\n"
		expect(findReadmeMarkerIssues(readme)).toEqual([])
	})

	it("accepts a marker whose sentence continues on the same line", () => {
		expect(findReadmeMarkerIssues("## A\n> **Ships in 1.2.3.** Later.\n")).toEqual([])
	})

	it("ignores a marker that sits under a level-one heading", () => {
		expect(findReadmeMarkerIssues("# Title\n\n> **Ships in 0.2.0-beta.1.**\n")).toEqual([])
	})
})
