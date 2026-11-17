/**
 * Paths in `TH_2026_PARAMETERS` that are not statutory figures, so they carry no source row.
 *
 * `taxYear` names the year the table applies to and `currency` names the unit; neither is a
 * statutory amount. A unit test asserts each still exists in the parameters, so the list cannot rot
 * into an exemption for a real figure.
 */
export const TH_SOURCE_EXEMPT_PATHS: readonly string[] = ["currency", "taxYear"]
