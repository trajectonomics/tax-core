# State tax reference sources

Raw official documents live in `references/states/` and are **git-ignored** (large, third-party,
re-downloadable). This manifest is the tracked record of where each came from and what it
verified. Every state row names the document URL, the local file, the date it was read and the
result, so a reviewer can recheck any figure from a fresh checkout.

Rows read on 2026-11-01, 2026-11-03 and 2026-11-05 were collected on an earlier host, so their
raw files are not in this checkout; re-download them from the URL in the row. The files stored
here on 2026-11-08 are `SC-2026-H4216-Act110.htm`, `SC-2026-WH1603F.pdf`,
`AR-2026-Withholding-Tax-Formula.pdf`, `CA-2026-540-tax-rate-schedules.pdf`,
`CA-2026-540-ES-instructions.pdf` and `VT-2026-GB-1210.pdf`. The files stored here on 2026-11-13
are `DE-2026-PIT-EST-instructions.pdf`, `MT-2026-Publication-1.pdf`,
`VT-2026-IN-114-Instructions.pdf`, `DC-2026-individual-income-tax-rates.html` and
`PA-2026-personal-income-tax.html`.

Download with `curl -L -A "Mozilla/5.0 Chrome/126" <url>`. Hosts that refuse automated clients on
2026-11-08: `mass.gov`, `michigan.gov` and `tax.ri.gov` return 403, `revenue.nebraska.gov` and
`tax.pa.gov` do not answer, `arkleg.state.ar.us` timed out, and `tax.nd.gov` serves
"inaccessible due to geographical restrictions" for every PDF from this host (its HTML landing
pages load, its PDFs do not). Those need a browser on a US network; see the follow-up ticket.

On 2026-11-13 a second host resolved every other state department by name and read it over HTTPS
(`--resolve` with a lookup from a public resolver, where the local resolver had no answer).
`tax.pa.gov` and `revenue.nebraska.gov` do not resolve at all (`nebraska.gov` returns no
reachable authority), `www.revenue.pa.gov` answers instead, `www.ksrevenue.gov` times out on
connect, and `mass.gov`, `michigan.gov`, `tax.ri.gov` and the `tax.nd.gov` PDFs still refuse this
host. The per-state result of that sweep is the 2026-11-13 table below.

## 2026-11-13 collection attempt

Every state in the follow-up issue was retried on this host. "No 2026 document" means the
department's own index answers but lists no 2026 individual income tax rate schedule or
instruction; the state keeps the level its row has below rather than a guessed figure.

| State | Host | Result |
| --- | --- | --- |
| AL | `revenue.alabama.gov` | 200; the forms index lists no 2026 individual income tax form or rate schedule (only the 2026 A-1, A-3 and A-6 corporate forms). No 2026 document |
| AR | `www.dfa.arkansas.gov` | 200; the individual income tax page lists no 2026 AR1000 or joint bracket table. `arkleg.state.ar.us` times out. No 2026 document |
| DC | `otr.cfo.dc.gov` | 200; the income tax rate page prints the seven-band schedule. **Read** |
| DE | `revenuefiles.delaware.gov` | 200; 2026 PIT-EST instructions print the whole schedule. **Read** |
| KS | `www.ksrevenue.gov` | connect timeout from this host. No document |
| MS | `www.dor.ms.gov` | 200; no 2026 Form 80-105 instructions; the 2026 weekly table states no rate. No 2026 document |
| MT | `revenuefiles.mt.gov` | 200; 2026 Publication 1 prints the 2026 tax tables. **Read** |
| ND | `www.tax.nd.gov` | HTML 200, every PDF 403 "inaccessible due to geographical restrictions"; only ND-1ES 2026 and the 2026 withholding rates booklet are published. No 2026 rate booklet |
| NE | `revenue.nebraska.gov` | no DNS answer for the zone from this host. No document |
| NJ | `www.nj.gov/treasury/taxation` | 200; no 2026 NJ-1040 instructions or rate schedule. No 2026 document |
| NM | `www.tax.newmexico.gov` | 200; no 2026 PIT-1 instructions or rate schedule. No 2026 document |
| OK | `www.tax.ok.gov` | 200; no 2026 Form 511 instructions or rate schedule. No 2026 document |
| OR | `www.oregon.gov/dor` | 200; no 2026 OR-40 or rate chart; the 2026 withholding formula still prints the 2025 amounts. No 2026 document |
| PA | `www.pa.gov` | 200; the department's personal income tax page states the 3.07% rate and that there is no standard deduction or personal exemption. **Read** |
| RI | `tax.ri.gov` | 403 to every request. No document |
| VT | `tax.vermont.gov` | 200; 2026 Form IN-114 instructions print all four 2026 schedules. **Read** |
| WI | `www.revenue.wi.gov` | 200; the 2026 forms index links no 2026 instruction or rate schedule. No 2026 document |

**Important limit.** Most official documents here are *employer withholding* publications. They
prove rates, brackets and standard deductions only where the withholding method is the statutory
schedule. Where a withholding table is calibrated differently (Ohio, North Dakota, Nebraska,
Vermont wage-bracket charts) it cannot confirm our statutory figures.

## Verification levels

Each state's parameter table carries the same level as its row here
(`UsStateVerification` in `src/us/state/parameters/verification.ts`):

- **official** — an official 2026 document (or enacted bill) was read for the state and the
  table either matches it or was corrected from it. The row states which figures were read.
- **partial** — the document read covers only part of the table; the row names the figures that
  the document does not state and that therefore remain unverified.
- **reported** — the figures agree only with secondary reports (news, vendor summaries) because
  the official document could not be read.
- **unconfirmed** — no official document and no agreeing report was read.

Tally: 24 official (15 documented states plus the 9 no-tax states), 8 partial, 6 reported,
13 unconfirmed. `src/us/tests/state-parameters.test.ts` fails if the tally drifts without this
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
| DE | `DE-2026-PIT-EST-instructions.pdf` | https://revenuefiles.delaware.gov/2025/PITForms_Instructions/Instructions/PIT-EST_Instructions_2026-01.pdf | 2026-11-13 | match: 2.2% to $5,000, 3.9% to $10,000, 4.8% to $20,000, 5.2% to $25,000, 5.55% to $60,000 and 6.6% above, so the first $2,000 is untaxed; standard deduction $3,250 / $6,500; $110 personal credit per federal exemption. The printed base amounts are truncated to whole dollars, so a filer at $96,750 computes $0.50 above the table ($2,943.50 actual vs $2,943.00 printed). **Not modeled**: the $2,500 additional deduction at 65+ or blind, the pension exclusion and the age-60 exemption credit |
| PA | `PA-2026-personal-income-tax.html` | https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/personal-income-tax | 2026-11-13 | match: 3.07% on taxable income, and the page states the tax provides no standard deduction or personal exemption, which is the whole table. The rate is statutory and has no indexed 2026 amount |

### No wage income tax: 9 states

AK, FL, NV, NH, SD, TN, TX, WA, WY. Confirmed by statute rather than an annual publication —
there is no 2026 rate or bracket to index. Washington taxes long-term capital gains only, and
New Hampshire and Tennessee repealed their interest and dividends taxes.
`src/us/state/parameters/none.ts` carries the citation.

## Partial: some applied figures not published

| State | Local file | Source URL | Read | Confirmed / not yet published |
| --- | --- | --- | --- | --- |
| SC | `SC-2026-H4216-Act110.htm`, `SC-2026-WH1603F.pdf` | https://www.scstatehouse.gov/sess126_2025-2026/bills/4216.htm | 2026-11-08 | **fixed**: Act 110 of 2026 (H.4216, ratified R 117, signed 2026-03-30), taxable years beginning after 2025 — 1.99% to $30,000, 5.21% above ("5.21% x amount - $966"), and the SCIAD of $15,000 / $30,000 / $22,500 phased out over $40,000 / $80,000 / $60,000 by $55,000 / $110,000 / $82,500 with each reduction floored to $10 (§ 12-6-1140(15)(c)). **Not published**: the § 12-6-520 indexation of the $30,000 bracket for 2026, and the 2026 dependent exemption (the engine carries $4,930 forward from the previous table; neither the act nor WH-1603F states a 2026 amount). The DOR WH-1603F (Rev. 11/4/25) predates the act and still prints 0 / 3 / 6%. The act also raised the earned income tax credit to 125% of the federal credit, capped at $200; this engine models no state EITC |
| CA | `CA-2026-540-tax-rate-schedules.pdf`, `CA-2026-540-ES-instructions.pdf` | https://www.ftb.ca.gov/forms/2026/2026-540-tax-rate-schedules.pdf | 2026-11-08 | **confirmed**: all three bracket schedules. **Not published**: 2026 standard deduction and exemption credits — the 540-ES instructions still send filers to the 2025 instructions, so $5,900 / $11,800, $158 / $316 and $491 remain 2025 x 1.034 estimates |
| NY | `NY-2026-NYS-50-T-NYS.pdf` | https://www.tax.ny.gov/pdf/publications/withholding/nys50_t_nys.pdf | 2026-11-01 | single brackets and the 3.9 / 4.4 / 5.15 / 5.4 / 5.9% rates match; **not printed**: married and HoH brackets |
| DC | `DC-2026-individual-income-tax-rates.html` | https://otr.cfo.dc.gov/page/dc-individual-and-fiduciary-income-tax-rates | 2026-11-13 | **confirmed**: the seven-band schedule (4 / 6 / 6.5 / 8.5 / 9.25 / 9.75 / 10.75% at $10,000 / $40,000 / $60,000 / $250,000 / $500,000 / $1,000,000) for tax years beginning after 2021. **Not printed**: the $16,100 / $32,200 / $24,150 standard deduction the engine applies; this page does not state it |
| MT | `MT-2026-Publication-1.pdf` | https://revenuefiles.mt.gov/files/Forms/Publication-1/Publication-1-2026.pdf | 2026-11-13 | **fixed**: head-of-household threshold $71,250 (the engine applied the single $47,500); 4.7% to $47,500 / $95,000 / $71,250 and 5.65% above, for single (and separate) / joint / HoH. House Bill 337 set the 2026 brackets. **Not printed**: the $16,100 / $32,200 / $24,150 standard deduction, which the publication adopts by reference ("the same as your federal standard deduction") without stating an amount, so the row stays partial |
| VT | `VT-2026-IN-114-Instructions.pdf` | https://tax.vermont.gov/sites/tax/files/documents/IN-114-Instr-2026.pdf | 2026-11-13 | **fixed**: 2026 thresholds 3.35 / 6.6 / 7.6 / 8.75% at $50,750 / $122,850 / $256,300 (single), $84,700 / $204,750 / $312,050 (joint), $68,000 / $175,500 / $284,150 (HoH) and half of joint for separate filers, where the engine still carried the 2025 $49,400 / $119,700 / $249,700, the joint $82,500 / $199,450 / $304,000 and the single schedule for HoH. **Not printed**: the $7,650 / $15,300 standard deduction and the $5,300 personal exemption; the rates are labelled "2026 Preliminary" |
| OH | `OH-2026-percentage-method.pdf`, `OH-2026-optional-computer-formula.pdf` | https://dam.assets.ohio.gov/image/upload/tax.ohio.gov/employer_withholding/2026%20Withholding%20Tables/WHT_PercentageMethod_2026.pdf | 2026-11-01 | $26,050 zero-bracket threshold confirmed; **not the statutory rate**: the withholding rates are 1.6 / 2.99 / 3.4%, not 2.75% |
| AR | `AR-2026-Withholding-Tax-Formula.pdf` | https://www.dfa.arkansas.gov/wp-content/uploads/Withholding-Tax-Formula.pdf (same PDF as `whformula_2026.pdf`) | 2026-11-08 | **confirmed**: the formula now served on that URL (PDF modified 2026-05-30; the revision the issue dates 2026-05-29) prints 0% to $5,599, then 2%, 3%, 3.4% to $26,399 and **3.70%** above, with the $2,470 deduction and the $29 per-exemption credit, so the 3.7% top rate rests on the DFA document and not on reports. **Not printed**: the joint bracket table, which the engine sets equal to the single thresholds |

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
| KS | 5.2 / 5.58% at $23,000 / $46,000 | No 2026 document read; `ksrevenue.gov` does not answer this host | 2026-11-13 |
| MS | 4% above $10,000, $2,300 / $4,600 | `MS-2026-weekly-table.pdf` is a lookup keyed by exemption amount and states neither the rate nor the deduction | 2026-11-03 |
| ND | 1.95 / 2.5% at $48,475 / $244,825 (single), $80,975 / $298,075 (joint) — probably 2025 values | `tax.nd.gov` serves "geographical restrictions" to this host; the 2026 withholding zero band ($57,625 single / $57,500 married) does not map to our statutory figures | 2026-11-08 |
| NE | 2.46 / 3.51 / 4.55%, $8,850 / $17,700 | `revenue.nebraska.gov` has no DNS answer from this host | 2026-11-13 |
| NJ | 1.4% to 10.75% eight-band schedule, $1,000 exemption, no deduction | No 2026 document read | 2026-11-01 |
| NM | 1.5% to 5.9% six-band schedule | No 2026 document read | 2026-11-01 |
| OK | 2.5 / 3.5 / 4.5%, deduction $6,350 / $12,700 / $9,350 | No 2026 document read | 2026-11-01 |
| OR | 4.75% to 9.9% at $4,550 / $11,400 / $125,000, $2,910 / $5,820 deduction, $256 credit | `OR-2026-withholding-tax-formulas.pdf` still prints the 2025 amounts, which happen to match the engine, so **no 2026 amount is confirmed** | 2026-11-03 |
| RI | 3.75 / 4.75 / 5.99% at $82,050 / $186,450, $11,200 deduction | `tax.ri.gov` returns 403 | 2026-11-13 |
| WI | 3.5 / 4.4 / 5.3 / 7.65% at $15,110 / $51,950 / $332,720, $13,960 / $25,840 deduction | No 2026 document read | 2026-11-13 |

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
| 2026-11-13 | DE | six-band schedule, $3,250 / $6,500 standard deduction and $110 credit read from the 2026 PIT-EST instructions; `unconfirmed` to `official` |
| 2026-11-13 | MT | HoH threshold $71,250 instead of the single $47,500, from 2026 Publication 1; stays `partial` because the standard deduction is adopted by reference, not printed |
| 2026-11-13 | PA | 3.07% with no standard deduction or personal exemption confirmed on the department's personal income tax page; `unconfirmed` to `official` |
| 2026-11-13 | VT | 2026 thresholds $50,750 / $122,850 / $256,300 single, $84,700 / $204,750 / $312,050 joint and a separate HoH schedule (was 2025 values and the single schedule for HoH), from the 2026 IN-114 instructions; `unconfirmed` to `partial` |
| 2026-11-13 | DC | seven-band schedule confirmed on the OTR rate page; `unconfirmed` to `partial` because the standard deduction is not printed there |

## Open items

1. Every **unconfirmed** state needs a 2026 document once the state publishes it. On 2026-11-13
   AL, NJ, NM, OK, OR, WI and MS answered but list no 2026 individual income tax schedule yet;
   KS, NE, RI and the ND PDFs still need a browser on a US network (MA and MI too).
2. DC's and VT's standard deductions are the remaining unprinted figures; both need the 2026
   return instructions, which the departments have not published.
3. AR's joint bracket table is not printed in the DFA formula, which is a single-employee
   formula; the engine applies the single thresholds to married filers and the 2026 AR1000
   schedule needs to be read before either is changed.
4. SC's bracket table is indexed under § 12-6-520; no 2026 indexed amount is published, so the
   engine uses the act's own $30,000 threshold, and the $4,930 dependent exemption is carried
   forward from the previous table without a 2026 source.
5. ME's head-of-household phase-out range is derived from the single and joint starts rather than
   printed in a document.
6. CA's 2026 standard deduction and exemption credits are still 2025 x 1.034 estimates.
7. MT's standard deduction is adopted by reference from the federal return, and VT's is carried
   forward from 2025: neither is printed in a 2026 state document.
