/**
 * Result vocabulary of a source manifest row, mirroring `references/th/SOURCES.md`: the document
 * matched the engine (`match`), the figure was derived from documented figures (`derived`), only a
 * secondary source states it (`reported`), nothing readable states it (`unsourced`), or the engine
 * was corrected from the document (`fixed`).
 */
export const TH_SOURCE_RESULTS = ["match", "derived", "reported", "unsourced", "fixed"] as const

/** One value of {@link TH_SOURCE_RESULTS}. */
export type ThSourceResult = (typeof TH_SOURCE_RESULTS)[number]

/**
 * Purpose: Recognizes a manifest result word, so the parser rejects a typo instead of counting it
 * as a row.
 * Math: Membership in {@link TH_SOURCE_RESULTS}.
 * Units: None.
 * Throws: Never.
 */
export function isThSourceResult(value: string): value is ThSourceResult {
	return (TH_SOURCE_RESULTS as readonly string[]).includes(value)
}
