/**
 * A README release marker that does not follow `cli` ADR-0034's form.
 */
export interface ReadmeMarkerIssue {
	/** 1-based line number of the marker. */
	readonly line: number
	/** What is wrong with it, naming the version it carries. */
	readonly message: string
}

const SECTION = /^##\s+\S/
const MARKER = /^>\s*\*\*Ships in (.+?)\.\*\*/
const STRICT_VERSION = /^\d+\.\d+\.\d+$/

/**
 * Purpose: Enforces the release marker form this repository adopted in ADR 0005,
 * so a section that promises an unreleased export names a strict `X.Y.Z` release.
 * Math: For each level-two heading, the first non-blank line is its first line; a
 * marker there is valid only when the version between `Ships in ` and `.**` is
 * exactly three dot-separated numbers. A marker anywhere else in a section is
 * prose, not a marker, and is ignored.
 * Units: Line numbers are 1-based.
 * Throws: Never.
 */
export function findReadmeMarkerIssues(markdown: string): readonly ReadmeMarkerIssue[] {
	const issues: ReadmeMarkerIssue[] = []
	let expectingFirstLine = false
	for (const [index, line] of markdown.split("\n").entries()) {
		if (SECTION.test(line)) {
			expectingFirstLine = true
			continue
		}
		if (!expectingFirstLine || line.trim() === "") continue
		expectingFirstLine = false
		const marker = MARKER.exec(line.trim())
		const version = marker?.[1]
		if (version !== undefined && !STRICT_VERSION.test(version)) {
			issues.push({
				line: index + 1,
				message: `release marker names "${version}"; use a strict X.Y.Z with no prerelease tag`,
			})
		}
	}
	return issues
}
