# State tax reference sources

Raw official documents live in `references/states/` and are **git-ignored** (large, third-party,
re-downloadable). This manifest is the tracked record of where each came from and what it
verified. Every state row names the document URL, the local file, the date it was read and the
result, so a reviewer can recheck any figure from a fresh checkout.

Rows read on 2026-11-01, 2026-11-03 and 2026-11-05 were collected on an earlier host, so their
raw files are not in this checkout; re-download them from the URL in the row. The files stored
here on 2026-11-08 are `SC-2026-H4216-Act110.htm`, `SC-2026-WH1603F.pdf`,
`AR-2026-Withholding-Tax-Formula.pdf`, `CA-2026-540-tax-rate-schedules.pdf`,
`CA-2026-540-ES-instructions.pdf` and `VT-2026-GB-1210.pdf`.

Download with `curl -L -A "Mozilla/5.0 Chrome/126" <url>`. Hosts that refuse automated clients on
2026-11-08: `mass.gov`, `michigan.gov` and `tax.ri.gov` return 403, `revenue.nebraska.gov` and
`tax.pa.gov` do not answer, `arkleg.state.ar.us` timed out, and `tax.nd.gov` serves
"inaccessible due to geographical restrictions" for every PDF from this host (its HTML landing
pages load, its PDFs do not). Those need a browser on a US network; see the follow-up ticket.

**Important limit.** Most official documents here are *employer withholding* publications. They
prove rates, brackets and standard deductions only where the withholding method is the statutory
schedule. Where a withholding table is calibrated differently (Ohio, North Dakota, Nebraska,
Vermont wage-bracket charts) it cannot confirm our statutory figures.

## Verification levels

Each state's parameter table carries the same level as its row here
(`UsStateVerification` in `src/us/state/parameters/verification.ts`):

- **official** — every rate, bracket and deduction or exemption amount the table applies is
  stated in an official document or enacted bill. A derived amount (a doubled joint threshold,
  an MFS half) is allowed and is named in the row.
- **partial** — an official document confirms the rate schedule and the deduction or exemption
  amounts the row names, but at least one figure the table applies is not published yet and is
  named in the row.
- **reported** — the figures agree only with secondary reports (news, vendor summaries) because
  the official document could not be read.
- **unconfirmed** — no official document and no agreeing report was read.

Tally: 22 official (13 documented states plus the 9 no-tax states), 6 partial, 6 reported,
17 unconfirmed. `src/us/tests/state-parameters.test.ts` fails if the tally drifts without this
table being updated.

## Official: every applied figure confirmed

| State | Local file | Source URL | Read | Result |
| --- | --- | --- | --- | --- |
| CT | `CT-ip-2026-1.pdf`, `CT-2026-withholding-tables.pdf` | https://portal.ct.gov/-/media/drs/publications/pubsip/2026/ip-2026-1.pdf | 2026-11-01 | match: single / joint / HoH brackets; exemptions $12,000 / $15,000 / $19,000 / $24,000 (separate $12,000) |
| KY | `KY-2026-withholding-formula.pdf` | https://revenue.ky.gov/Forms/2026%20Withholding%20Formula.pdf | 2026-11-01 | match: 3.5%, $3,360 |
| MO | `MO-2026-withholding-formula.pdf` | https://dor.mo.gov/forms/Withholding%20Formula_2026.pdf | 2026-11-01 | match: single thresholds $1,348 to $9,436; joint and HoH are the doubled thresholds; $16,100 deduction |
| MN | `MN-2026-inflation-adjusted-amounts.pdf`, `MN-2026-wh-inst.pdf` | https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf | 2026-11-03 | match: deduction 15,300 / 30,600 / 23,000, dependent exemption $5,300; phase-outs per Minn. Stat. §§ 290.0121 subd. 2, 290.0123 subd. 5 |
| ME | `ME-2026-wh-tab-instr-August2026.pdf` | https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/26_wh_tab_instr_August2026.pdf | 2026-11-01 | match: brackets, $5,300 exemption, $15,700 / $31,400 deduction; 2% surcharge and $102,250 / $204,550 deduction phase-out per 36 M.R.S. §§ 5111(7), 5124-C(2). **HoH phase-out range is derived** from the single and joint starts |
| NC | `NC-2026-NC30.pdf` | https://www.ncdor.gov/income-tax-withholding-tables-and-instructions-employers/open | 2026-11-01 | match: 3.99%, $12,750 threshold; the joint $25,500 is the doubled threshold |
| HI | `HI-ann24-03.pdf`, `HI-2026-booklet-A.pdf` | https://files.hawaii.gov/tax/news/announce/ann24-03.pdf | 2026-11-01 | **fixed**: 2026 deduction $8,000 / $16,000 / $12,000 (Act 46) |
| MD | `MD-2026-withholding-guide.pdf` | https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/instructions/withholding/2026/withholding-guide.pdf | 2026-11-01 | **fixed**: deduction $3,400 single, $6,800 joint (doubled, not printed) |
| GA | `GA-2026-employers-tax-guide-updated-june.pdf` | https://dor.georgia.gov/document/document/2026-employers-tax-guide-updated-june-2026/download | 2026-11-01 | **fixed**: 4.99% from 2026-05-11, deduction $15,000 / $30,000, dependent allowance $5,000 |
| WV | `WV-2026-SB392-sub1-enr.pdf` | https://code.wvlegislature.gov/signed_bills/2026%5C2026-RS-SB392-SUB1%20ENR_signed.pdf | 2026-11-01 | **fixed**: W. Va. Code § 11-21-4j, 2.11 / 2.81 / 3.16 / 4.22 / 4.58% at $10k / $25k / $40k / $60k |
| IA | `IA-2026-withholding-formula.pdf` | https://revenue.iowa.gov/media/53/download | 2026-11-01 | match: 3.80%; $16,100 deduction and $40 credit are federal-conforming |
| LA | `LA-2026-RIB-26-005.pdf` | https://dam.ldr.la.gov/lawspolicies/RIB%2026-005-Updated%20Withholding%20Tables.pdf | 2026-11-03 | **fixed**: deduction $12,875 / $25,750, joint size for HoH and surviving spouse. The bulletin is a CPI-U estimate as of 2025-12-01 |
| UT | `UT-2026-SB0060-enrolled.pdf` | https://le.utah.gov/Session/2026/bills/enrolled/SB0060.pdf (web.archive.org snapshot 20261008030309) | 2026-11-05 | **fixed**: 4.45% under Utah Code § 59-10-104(2)(b) as amended by S.B. 60, retroactive to 2026-01-01 |

### No wage income tax: 9 states

AK, FL, NV, NH, SD, TN, TX, WA, WY. Confirmed by statute rather than an annual publication —
there is no 2026 rate or bracket to index. Washington taxes long-term capital gains only, and
New Hampshire and Tennessee repealed their interest and dividends taxes.
`src/us/state/parameters/none.ts` carries the citation.

## Partial: some applied figures not published

| State | Local file | Source URL | Read | Confirmed / not yet published |
| --- | --- | --- | --- | --- |
| SC | `SC-2026-H4216-Act110.htm`, `SC-2026-WH1603F.pdf` | https://www.scstatehouse.gov/sess126_2025-2026/bills/4216.htm | 2026-11-08 | **fixed**: Act 110 of 2026 (H.4216, ratified R 117, signed 2026-03-30), taxable years beginning after 2025 — 1.99% to $30,000, 5.21% above ("5.21% x amount - $966"), and the SCIAD of $15,000 / $30,000 / $22,500 phased out over $40,000 / $80,000 / $60,000 by $55,000 / $110,000 / $82,500 with each reduction floored to $10 (§ 12-6-1140(15)(c)). **Not published**: the § 12-6-520 indexation of the $30,000 bracket for 2026, and the 2026 dependent exemption (engine keeps 2025's $4,930). The DOR WH-1603F (Rev. 11/4/25) predates the act and still prints 0 / 3 / 6%. The act also raised the earned income tax credit to 125% of the federal credit, capped at $200; this engine models no state EITC |
| CA | `CA-2026-540-tax-rate-schedules.pdf`, `CA-2026-540-ES-instructions.pdf` | https://www.ftb.ca.gov/forms/2026/2026-540-tax-rate-schedules.pdf | 2026-11-08 | **confirmed**: all three bracket schedules. **Not published**: 2026 standard deduction and exemption credits — the 540-ES instructions still send filers to the 2025 instructions, so $5,900 / $11,800, $158 / $316 and $491 remain 2025 x 1.034 estimates |
| NY | `NY-2026-NYS-50-T-NYS.pdf` | https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf | 2026-11-01 | single brackets and the 3.9 / 4.4 / 5.15 / 5.4 / 5.9% rates match; **not printed**: married and HoH brackets |
| MT | `MT-2026-publication-1.pdf` | https://revenuefiles.mt.gov/files/Forms/Publication-1/Publication-1-2026.pdf | 2026-11-01 | 5.65% top rate confirmed; **not printed**: bracket thresholds and the $16,100 / $32,200 deduction |
| OH | `OH-2026-percentage-method.pdf`, `OH-2026-optional-computer-formula.pdf` | https://dam.assets.ohio.gov/image/upload/tax.ohio.gov/employer_withholding/2026%20Withholding%20Tables/WHT_PercentageMethod_2026.pdf | 2026-11-01 | $26,050 zero-bracket threshold confirmed; **not the statutory rate**: the withholding rates are 1.6 / 2.99 / 3.4%, not 2.75% |
| AR | `AR-2026-Withholding-Tax-Formula.pdf` | https://www.dfa.arkansas.gov/wp-content/uploads/Withholding-Tax-Formula.pdf (same PDF as `whformula_2026.pdf`) | 2026-11-08 | **confirmed**: the formula as revised 2026-05-30 prints 0% to $5,599, then 2%, 3%, 3.4% to $26,399 and **3.70%** above, with the $2,470 deduction and the $29 per-exemption credit — so the 3.7% top rate is backed by the DFA document rather than by reports. An earlier read of the first page only saw the pre-revision 3.90% and wrongly recorded a conflict. **Not printed**: the joint bracket table, which the engine sets equal to the single thresholds |

## Reported: only secondary sources agree

| State | Figures | Document to request | Report | Read |
| --- | --- | --- | --- | --- |
| MA | 5%, $4,400 / $8,800 / $6,800, 4% surtax at $1,107,750 | 2026 Form 1-ES instructions (`mass.gov` returns 403) | 2026 Form 1-ES instructions, seen only through search snippets | 2026-11-01 |
| MI | 4.25%, $5,900 exemption | Form 446 of 2026 (`michigan.gov` returns 403) | Form 446 reports | 2026-11-01 |
| IL | 4.95%, $2,925 exemption | 2026 IL-1040 instructions (`tax.illinois.gov`, timed out) | DOR 2026 publication summaries | 2026-11-01 |
| IN | 2.95%, $1,000 exemption | 2026 IT-40 instructions (`in.gov/dor`, timed out) | DOR 2026 publication summaries | 2026-11-01 |
| ID | 5.3%, $4,811 zero-bracket threshold | 2026 Form 40 instructions (`tax.idaho.gov`, timed out) | DOR 2026 publication summaries | 2026-11-01 |
| VA | $8,750 / $17,500 deduction for 2025 and 2026 | 2026 Form 760 instructions (`tax.virginia.gov`, timed out) | 2026 Form 760 reports | 2026-11-01 |

None of these six has a local file: no URL for them is recorded because none was downloaded, and
a guessed deep link would be worse than none. The host and form name are what a browser needs.

## Unconfirmed

| State | Figure awaiting a document | What was tried | Checked |
| --- | --- | --- | --- |
| AL | 2 / 4 / 5% at $500 / $3,000, deduction $3,000 / $8,500 / $5,200, exemption $1,500 | No 2026 rate schedule found; the 2026 forms were not published | 2026-11-01 |
| AZ | 2.5%, $16,100 / $32,200 federal-conforming deduction | No 2026 document read | 2026-11-01 |
| CO | 4.4%, $16,100 / $32,200 | `CO-2026-DR0004.pdf` is the allowance form only and states no rate | 2026-11-01 |
| DC | 4% to 10.75% seven-band schedule, $16,100 / $32,200 / $24,150 | No 2026 document read | 2026-11-01 |
| DE | 2.2% to 6.6% six-band schedule, $3,250 / $6,500 | No 2026 document read | 2026-11-01 |
| KS | 5.2 / 5.58% at $23,000 / $46,000 | No 2026 document read | 2026-11-01 |
| MS | 4% above $10,000, $2,300 / $4,600 | `MS-2026-weekly-table.pdf` is a lookup keyed by exemption amount and states neither the rate nor the deduction | 2026-11-03 |
| ND | 1.95 / 2.5% at $48,475 / $244,825 (single), $80,975 / $298,075 (joint) — probably 2025 values | `tax.nd.gov` serves "geographical restrictions" to this host; the 2026 withholding zero band ($57,625 single / $57,500 married) does not map to our statutory figures | 2026-11-08 |
| NE | 2.46 / 3.51 / 4.55%, $8,850 / $17,700 | `revenue.nebraska.gov` does not answer | 2026-11-01 |
| NJ | 1.4% to 10.75% eight-band schedule, $1,000 exemption, no deduction | No 2026 document read | 2026-11-01 |
| NM | 1.5% to 5.9% six-band schedule | No 2026 document read | 2026-11-01 |
| OK | 2.5 / 3.5 / 4.5%, deduction $6,350 / $12,700 / $9,350 | No 2026 document read | 2026-11-01 |
| OR | 4.75% to 9.9% at $4,550 / $11,400 / $125,000, $2,910 / $5,820 deduction, $256 credit | `OR-2026-withholding-tax-formulas.pdf` still prints the 2025 amounts, which happen to match the engine, so **no 2026 amount is confirmed** | 2026-11-03 |
| PA | 3.07% flat, no deduction | `tax.pa.gov` does not answer | 2026-11-08 |
| RI | 3.75 / 4.75 / 5.99% at $82,050 / $186,450, $11,200 deduction | `tax.ri.gov` returns 403 | 2026-11-01 |
| VT | **Likely 2025 values**: 3.35 / 6.6 / 7.6 / 8.75% at $49,400 / $119,700 / $249,700 (single), $82,500 / $199,450 / $304,000 (joint), $7,650 / $15,300 deduction | `TaxRateSched-2026.pdf` is 404 (not published); `GB-1210-2026.pdf` is a wage-bracket chart keyed by allowances, though its band widths are about 2.7% wider than ours (single 50,750 vs 49,400, joint 84,700 vs 82,500), which points at a mismatch | 2026-11-08 |
| WI | 3.5 / 4.4 / 5.3 / 7.65% at $15,110 / $51,950 / $332,720, $13,960 / $25,840 deduction | No 2026 document read | 2026-11-01 |

## Modeled statutory rules

| Rule | State | Source | Since |
| --- | --- | --- | --- |
| Per-status surtax threshold | ME | 36 M.R.S. § 5111(7) | 2026-11-03 |
| Linear standard-deduction phase-out | ME | 36 M.R.S. § 5124-C(2) | 2026-11-03 |
| Tiered standard-deduction phase-out, capped at 80% | MN | Minn. Stat. § 290.0123 subd. 5 | 2026-11-03 |
| Stepped dependent-exemption phase-out | MN | Minn. Stat. § 290.0121 subd. 2 | 2026-11-03 |
| Linear deduction phase-out with a $10 reduction floor | SC | S.C. Code § 12-6-1140(15)(c) | 2026-11-08 |

## Correction log

| Date | States | What changed |
| --- | --- | --- |
| 2026-11-01 | none (initial sweep) | 21 states read against official documents |
| 2026-11-03 | ME, MN | 2% surcharge with per-status thresholds; standard-deduction and dependent-exemption phase-outs |
| 2026-11-03 | LA | HoH deduction is the joint $25,750, not 1.5x single |
| 2026-11-05 | UT | 4.45% (was 4.5%) under S.B. 60 |
| 2026-11-08 | SC | 1.99% / 5.21% schedule and the phased-out $15,000 / $30,000 / $22,500 SCIAD replace 0 / 3 / 6% on the former $16,100 deduction |
| 2026-11-08 | AR | manifest corrected: the revised DFA formula prints 3.70%, so the 3.7% top rate is confirmed; the joint table remains unverified |

## Open items

1. Every **unconfirmed** state needs a 2026 document once the state publishes it. The blocked
   hosts (MA, MI, NE, ND, PA, RI) need a browser on a US network.
2. AR's joint bracket table is not printed in the DFA formula, which is a single-employee
   formula; the engine applies the single thresholds to married filers and the 2026 AR1000
   schedule needs to be read before either is changed.
3. SC's bracket table is indexed under § 12-6-520; no 2026 indexed amount is published, so the
   engine uses the act's own $30,000 threshold, and the $4,930 dependent exemption is 2025's.
4. ME's head-of-household phase-out range is derived from the single and joint starts rather than
   printed in a document.
5. CA's 2026 standard deduction and exemption credits are still 2025 x 1.034 estimates.
