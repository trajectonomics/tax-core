/**
 * Verification levels for a state's 2026 parameter table, from the strongest to the weakest.
 *
 * - `unconfirmed`: neither an official document nor a matching secondary report was read.
 * - `reported`: only secondary reports (news, vendor summaries) agree with the table.
 * - `partial`: an official document confirms some figures (rates or amounts) but not all.
 * - `official`: an official state document or enacted bill confirms every figure.
 *
 * Every level is recorded per state in `references/SOURCES.md` with the document URL and
 * retrieval date.
 */
export const US_STATE_VERIFICATION_LEVELS = [
	"official",
	"partial",
	"reported",
	"unconfirmed",
] as const

/** How far a state's 2026 parameter table is verified against an official document. */
export type UsStateVerification = (typeof US_STATE_VERIFICATION_LEVELS)[number]
