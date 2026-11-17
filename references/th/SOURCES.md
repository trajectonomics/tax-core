# Thailand statutory source manifest

The tracked record of where every Thai statutory figure in `TH_2026_PARAMETERS` comes from.
`references/th/` is git-ignored for the raw documents (they are large, third-party and
re-downloadable, as `references/states/` already is); this manifest is the tracked part. A fresh
checkout therefore holds every citation and no binary.

`bun run check:th-sources` fails when a parameter path has no row here, when a row names no
parameter, or when a transcribed corpus file computes its own expectations.

## How to read a row

| Column | Means |
| --- | --- |
| Parameter path | The path in `TH_2026_PARAMETERS`, with array indices collapsed to `[*]`: one row per statutory figure, not per numeric leaf. |
| Figure | The amount as the document prints it. |
| Citation | The Revenue Code section plus the instrument that sets the current figure. |
| Document | The URL that was read, with its anchor where the page has one. |
| Read | The date the document was read. |
| Result | `match`, `derived`, `reported`, `unsourced`, or `fixed`, as below. A note after the word records how the figure was established or a disagreement with the engine. |

`match` — the document states the figure and the engine applies it.
`derived` — hand arithmetic or schedule structure from documented figures, with the working named
in the citation.
`reported` — only a secondary source states the 2026 figure; the instrument itself could not be
read. `reported` is enough for a transcribed corpus case (AGENTS.md rule 10 names
government-recognised filing calculators), never for a `match`.
`unsourced` — neither the instrument nor a secondary source was read. No corpus case asserts an
`unsourced` figure.
`fixed` — the engine was corrected from the document. Written only after the owner authorises the
change (OD5); no row carries it.

## Coverage

`TH_2026_PARAMETERS` holds 125 scalar leaves, 73 collapsed paths and 71 statutory figures.
`taxYear` and `currency` are not figures and are exempt (`src/th/references/exemptions.ts`).
This manifest has one row per remaining path.

## Sources of record, in order

1. The Revenue Code section that grants or limits the figure, in the Revenue Department's English
   publication at `https://www.rd.go.th/english/37749.html` (sections are addressable as
   `#section42bis`, `#section47`, `#section47bis`, `#section48`).
2. The instrument that moved the figure: an Amendment Act, a Royal Decree, a Ministerial
   Regulation or a Departmental Notification. The English publication prints the Code *as
   enacted*, not consolidated, so a row must name the instrument whenever an amendment moved the
   figure.
3. The Revenue Department's consolidated Thai Code at `https://www.rd.go.th/5937.html`, last
   updated 2023-11-14, which prints the current wording of Section 47 with each amending
   instrument in brackets.

The English personal income tax overview at `https://www.rd.go.th/english/6045.html` is **not** a
source of record. It still prints a 30,000 baht personal allowance, a 15,000 baht child allowance,
a 10,000 baht life insurance premium and a schedule topping out at 4,000,000 baht at 35 per cent,
labelled for the 2013 and 2014 tax years. It is cited only where nothing better was readable, and
then the row's result is `reported`.

## What this host could reach on 2026-11-17

| URL | Answer | Used for |
| --- | --- | --- |
| `rd.go.th/english/37749.html` | 200, HTML | Code sections as enacted |
| `rd.go.th/5937.html` | 200, HTML, updated 2023-11-14 | consolidated Section 47 |
| `rd.go.th/english/6045.html` | 200, labelled 2013-2014 | 40(5), 40(6) rates only |
| `rd.go.th/english/37771.html` | 500 | the income tax schedule page |
| `rd.go.th/1603.html` (Royal Decree index) | 200, Thai, lists decrees to No. 812 (B.E. 2569) | finding the decree PDFs |
| `fileadmin/.../p44.pdf`, `p46.pdf` | 200, text | Acts No. 44 and 46 |
| `fileadmin/.../dc470.pdf`, `dc480.pdf`, `dc629.pdf`, `dc634.pdf` | 200, text | Royal Decrees 470, 480, 629, 634 |
| `fileadmin/.../126.pdf` (M.R. No. 126) | 200, **image scan** | named, not read |
| `fileadmin/.../dc165.pdf` (R.D. No. 165) | 200, **image scan** | named, not read |
| `raidaai.com/articles/2569/...` | 200, Thai | 2026 caps for the allowance cluster |
| Thai pages without a browser | some 500, some 200 | the consolidated Code needed retries |

No OCR is available on this host, so the two scans above stay unread; their rows are `reported` or
`unsourced` rather than guessed.

## Findings

- **Recorded, not changed (OD5).** `allowances.retirementCluster.gpf.maxRate` applies 30 per cent
  of wages; the only 2026 figure read (Raidaai) prints 15 per cent for the provident-fund,
  government-pension-fund and teacher-fund group. The row records the disagreement. No corpus case
  asserts the rate.
- **`digitalAssetRate` is unsourced** (OD6). No 2026 rate was read; the code keeps 15 per cent with
  its assumption comment, and no corpus case asserts it.
- **Two citations in the code are wrong, and are recorded here rather than corrected.**
  `src/th/parameters.ts` names Royal Decree No. 650 for the bracket schedule, and
  `src/th/stages/separate-sheet.ts` names Section 42(1) for the severance exemption. R.D. No. 650
  is a 2017 flood-donation exemption, Section 42(1) is per-diem and transport expenses, and the
  schedule's instruments are Act No. 44 section 12 plus R.D. No. 470 section 4. Correcting those
  comments is outside this Ticket's "no code changes" scope, so they stay for the owner or a later
  Ticket; no figure and no stage changed.
- **Gaps.** The Section 48(4) holding-year expense table (R.D. No. 165) and the Section 48(5)
  400-day / 600,000 baht severance exemption (the instrument that grants it) are image scans or
  unread instruments, so their rows are `unsourced`. The Section 48(5) five-year condition rests
  on a Revenue Department news item, so it is `reported`. The Section 40(5)/40(6) expense rates
  rest on the Department's English overview, so they too are `reported`.

## Correction log

| Date | Figures | What changed |
| --- | --- | --- |
| 2026-11-17 | none (first sweep) | 71 rows written; 32 `match`, 6 `derived`, 28 `reported`, 5 `unsourced` |

<!-- factory:th-source-rows v1 -->

| Parameter path | Figure | Citation | Document | Read | Result |
| --- | --- | --- | --- | --- | --- |
| `allowances.child.basePerChild` | 30,000 baht each | Section 47(1)(c)(1), as amended by Act No. 46 (B.E. 2561) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p46.pdf | 2026-11-17 | match |
| `allowances.child.bonusCutoffYear` | born in or after B.E. 2561 (2018) | Section 47(1)(c)(1), as amended by Act No. 46 (B.E. 2561) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p46.pdf | 2026-11-17 | match |
| `allowances.child.bonusSecondPlusBorn2018OrLater` | an additional 30,000 baht each | Section 47(1)(c)(1), as amended by Act No. 46 (B.E. 2561) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p46.pdf | 2026-11-17 | match |
| `allowances.disabledPerPerson` | 60,000 baht each | Section 47(1)(k), as amended by Act No. 37 (B.E. 2552) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `allowances.donations.donation1xMaxRate` | not exceeding 10 per cent | Section 47(7) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `allowances.donations.donation2xMaxRate` | not exceeding 10 per cent | Section 47(7) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `allowances.donations.donation2xMultiplier` | twice the amount donated | Section 47(7); the doubling for education, sport, social development and public hospitals | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.lifeInsurance.combinedCeiling` | not exceeding 100,000 baht | Section 47(1)(d) and M.R. No. 126 (B.E. 2509) clause 2(61); the clause text is a scan | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/126.pdf | 2026-11-17 | reported (2026 cap from Raidaai; clause unreadable) |
| `allowances.lifeInsurance.healthCeiling` | not exceeding 25,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); the clause text is a scan | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/126.pdf | 2026-11-17 | reported (2026 cap from Raidaai; clause unreadable) |
| `allowances.mortgageInterestCeiling` | not exceeding 100,000 baht | Section 47(1)(h) and M.R. No. 126 (B.E. 2509) clause 2(61); the clause text is a scan | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/126.pdf | 2026-11-17 | reported (2026 cap from Raidaai; clause unreadable) |
| `allowances.parent.maxCount` | the taxpayer's and the spouse's parents | Section 47(1)(j) names four people: both parents of each spouse | https://www.rd.go.th/5937.html | 2026-11-17 | derived |
| `allowances.parent.perPerson` | 30,000 baht each | Section 47(1)(j), as amended by Act No. 36 (B.E. 2548) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `allowances.parentHealthInsuranceCeiling` | not exceeding 15,000 baht in total | M.R. No. 126 (B.E. 2509) clause 2(61); the clause text is a scan | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/126.pdf | 2026-11-17 | reported (2026 cap from Raidaai; clause unreadable) |
| `allowances.personal` | 60,000 baht | Section 47(1)(a), as amended by Act No. 44 (B.E. 2560) s.5 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `allowances.retirementCluster.combinedCeiling` | not exceeding 500,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61) retirement clause; text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.gpf.ceiling` | not exceeding 500,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.gpf.maxRate` | 15 per cent of wages | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai prints 15 per cent for the pension fund group; engine applies 30 — recorded, not changed) |
| `allowances.retirementCluster.nsf.ceiling` | not exceeding 30,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.pensionLifeInsurance.ceiling` | not exceeding 200,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.pensionLifeInsurance.maxRate` | 15 per cent of assessable income | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.pvd.ceiling` | not exceeding 500,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.pvd.maxRate` | 15 per cent of wages | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.rmf.ceiling` | not exceeding 500,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.rmf.maxRate` | 30 per cent of assessable income | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.ssf.ceiling` | not exceeding 200,000 baht | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.retirementCluster.ssf.maxRate` | 30 per cent of assessable income | M.R. No. 126 (B.E. 2509) clause 2(61); text is a scan | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.socialSecurityFundCeiling` | 10,500 baht | Section 47(1)(i) allows the amount actually paid; the ceiling is the annual maximum contribution | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569: 875 baht a month) |
| `allowances.spouse` | 60,000 baht | Section 47(1)(b), as amended by Act No. 44 (B.E. 2560) s.5 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `allowances.spouseLifeInsuranceCeiling` | not exceeding 10,000 baht | Section 47(1)(d) second paragraph | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `allowances.thaiEsg.ceiling` | not exceeding 300,000 baht | Thai ESG deduction, outside the 500,000 baht retirement ceiling | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `allowances.thaiEsg.maxRate` | 30 per cent of assessable income | Thai ESG deduction, outside the 500,000 baht retirement ceiling | https://raidaai.com/articles/2569/tax-deductions | 2026-11-17 | reported (Raidaai 2569) |
| `brackets[*].rate` | 0 / 5 / 10 / 15 / 20 / 25 / 30 / 35 per cent | Income tax schedule, as amended by Act No. 44 (B.E. 2560) s.12; zero on the first 150,000 baht by R.D. No. 470 (B.E. 2551) s.4 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `brackets[*].upTo` | 150,000 / 300,000 / 500,000 / 750,000 / 1,000,000 / 2,000,000 / 5,000,000 / none (top) | Income tax schedule, as amended by Act No. 44 (B.E. 2560) s.12, with the first 150,000 baht exempted by R.D. No. 470 (B.E. 2551) s.4 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc470.pdf | 2026-11-17 | match |
| `expenses.section40_1_2.ceiling` | not exceeding 100,000 baht | Section 42 bis, as amended by Act No. 44 (B.E. 2560) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `expenses.section40_1_2.rate` | 50 per cent | Section 42 bis, as amended by Act No. 44 (B.E. 2560) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `expenses.section40_3.ceiling` | not exceeding 100,000 baht in total | Section 42 ter, as amended by R.D. No. 634 (B.E. 2560) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc634.pdf | 2026-11-17 | match |
| `expenses.section40_3.rate` | 50 per cent | Section 42 ter, as amended by R.D. No. 634 (B.E. 2560) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc634.pdf | 2026-11-17 | match |
| `expenses.section40_4.rate` | no standard deduction | Sections 42 bis, 42 ter and 43-46 name only 40(1)-(3) and 40(5)-(8) income | https://www.rd.go.th/english/37749.html | 2026-11-17 | derived |
| `expenses.section40_5.agriculturalLand` | 20 per cent | Section 43 and R.D. No. 11 (B.E. 2502) s.5; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_5.building` | 30 per cent | Section 43 and R.D. No. 11 (B.E. 2502) s.5; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_5.nonAgriculturalLand` | 15 per cent | Section 43 and R.D. No. 11 (B.E. 2502) s.5; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_5.other` | 10 per cent | Section 43 and R.D. No. 11 (B.E. 2502) s.5; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_5.vehicles` | 30 per cent | Section 43 and R.D. No. 11 (B.E. 2502) s.5; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_6.medical` | 60 per cent | Section 44 and R.D. No. 11 (B.E. 2502) s.6; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_6.other` | 30 per cent | Section 44 and R.D. No. 11 (B.E. 2502) s.6; the decree text is not served | https://www.rd.go.th/english/6045.html | 2026-11-17 | reported (RD's English overview, last updated 2017) |
| `expenses.section40_7.rate` | 60 per cent | Section 45 and R.D. No. 629 (B.E. 2560) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `expenses.section40_8.entertainerCeiling` | not exceeding 600,000 baht in total | R.D. No. 629 (B.E. 2560) s.4(43) | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `expenses.section40_8.entertainerFirstTierRate` | 60 per cent of the first 300,000 baht | R.D. No. 629 (B.E. 2560) s.4(43)(a) | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `expenses.section40_8.entertainerFirstTierThreshold` | 300,000 baht | R.D. No. 629 (B.E. 2560) s.4(43) | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `expenses.section40_8.entertainerSecondTierRate` | 40 per cent of the excess | R.D. No. 629 (B.E. 2560) s.4(43)(b) | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `expenses.section40_8.generalRate` | 60 per cent | Section 46 and R.D. No. 629 (B.E. 2560) s.4 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc629.pdf | 2026-11-17 | match |
| `finalWithholding.digitalAssetRate` | no 2026 rate read | No instrument read; the code carries 15 per cent as a documented assumption (OD6) | https://www.rd.go.th/english/37749.html | 2026-11-17 | unsourced |
| `finalWithholding.dividendRate` | 10.0 per cent | Section 48(3), resident shareholder election | https://www.rd.go.th/english/37749.html | 2026-11-17 | match |
| `finalWithholding.interestRate` | 15.0 per cent | Section 48(3)(a) | https://www.rd.go.th/english/37749.html | 2026-11-17 | match |
| `minimumGrossTax.incomeThreshold` | assessable income from 120,000 baht | Section 48(2), as amended by Act No. 44 (B.E. 2560) s.10 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `minimumGrossTax.rate` | 0.5 per cent | Section 48(2), as amended by Act No. 44 (B.E. 2560) s.10 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | match |
| `minimumGrossTax.taxThreshold` | tax of not more than 5,000 baht is exempt | R.D. No. 480 (B.E. 2552) s.3 | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/dc480.pdf | 2026-11-17 | match |
| `realEstate.brackets[*].rate` | 5 / 10 / 15 / 20 / 25 / 30 / 35 per cent | The Section 48(1) schedule with the 0 per cent tier removed, annualised by the holding period | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | derived |
| `realEstate.brackets[*].upTo` | 300,000 / 500,000 / 750,000 / 1,000,000 / 2,000,000 / 5,000,000 / none (top) | The Section 48(1) schedule with the 0 per cent tier removed, annualised by the holding period | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | derived |
| `realEstate.expenseTable[*].minYears` | 1, 2, 3, 4, 5, 6, 7, 8 years | Section 48(4)(b) and R.D. No. 165 (B.E. 2529); the decree is a scan | https://www.rd.go.th/1603.html | 2026-11-17 | unsourced |
| `realEstate.expenseTable[*].rate` | 92 / 84 / 77 / 71 / 65 / 60 / 55 / 50 per cent | Section 48(4)(b) and R.D. No. 165 (B.E. 2529); the decree is a scan | https://www.rd.go.th/1603.html | 2026-11-17 | unsourced |
| `realEstate.inheritanceExpenseRate` | 50 per cent of the income | Section 48(4)(a) | https://www.rd.go.th/english/37749.html | 2026-11-17 | match |
| `realEstate.maxHoldingYears` | a period exceeding ten years counts as ten | Section 48(4) closing paragraph | https://www.rd.go.th/english/37749.html | 2026-11-17 | match |
| `realEstate.taxCapRate` | not exceeding 20 per cent of the sale price | Section 48(4) | https://www.rd.go.th/english/37749.html | 2026-11-17 | match |
| `separateSheet.brackets[*].rate` | 5 / 10 / 15 / 20 / 25 / 30 / 35 per cent | The Section 48(1) schedule with the 0 per cent tier removed | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | derived |
| `separateSheet.brackets[*].upTo` | 300,000 / 500,000 / 750,000 / 1,000,000 / 2,000,000 / 5,000,000 / none (top) | The Section 48(1) schedule with the 0 per cent tier removed | https://www.rd.go.th/fileadmin/user_upload/kormor/newlaw/p44.pdf | 2026-11-17 | derived |
| `separateSheet.exemptionCeiling` | not exceeding 600,000 baht | Severance exemption; the instrument that grants it was not read | https://www.rd.go.th/5937.html | 2026-11-17 | unsourced |
| `separateSheet.exemptionWageDays` | 400 days of the last wage | Severance exemption; the instrument that grants it was not read | https://www.rd.go.th/5937.html | 2026-11-17 | unsourced |
| `separateSheet.expensePerYearOfService` | 7,000 baht for each year of service | Section 48(5) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
| `separateSheet.minYearsOfService` | 5 years of service | Section 48(5) eligibility; the Revenue Department states the five-year condition for the ภ.ง.ด.90/91 attachment | https://www.rd.go.th/region/08/chiangrai/265/4618.html | 2026-11-17 | reported (RD Chiang Rai news item, 30 March 2026) |
| `separateSheet.remainderExpenseRate` | 50 per cent of the remainder | Section 48(5) | https://www.rd.go.th/5937.html | 2026-11-17 | match |
