# @trajectonomics/tax

Pure, deterministic statutory tax calculation engine with subpaths for Thailand (`@trajectonomics/tax/th`) and the United States (`@trajectonomics/tax/us`), covering 2026 federal tax plus all 50 state income tax systems and the District of Columbia.

## United States State Tax

`calculateUsTax` accepts an optional `state` code (`AL` through `WY` plus `DC`). When present, the result includes `breakdown.state` with state taxable income, bracket slices, personal/dependent credits, state withholding, and net state tax, and the state liability is folded into the top-level `totalTax` and `netTaxPayable`.

- Nine no-income-tax states (`AK`, `FL`, `NV`, `NH`, `SD`, `TN`, `TX`, `WA`, `WY`) return zero state tax and zero state rates.
- Sixteen flat-rate states (including `LA` and `OH`, which are single-rate in 2026) and twenty-five graduated-rate states plus `DC` use their 2026 standard deductions, personal/dependent exemptions, and statutory bracket tables.
- `MA` includes the 4% millionaire surtax and `CA` includes the 1% mental health services surtax.
- State inputs also include `stateDependents`, `stateWithholding`, and `stateCredits` (`nonRefundable` / `refundable`).
- State calculations start from federal AGI and apply the state standard deduction, personal/dependent exemptions or credits, and the state bracket table. Top-level `marginalRate` is the federal ordinary rate plus the state marginal rate. Head-of-household uses the state's joint schedule in `NJ`, `OR`, and `OK` and the single schedule elsewhere unless a dedicated table is encoded (`CA`, `MN`, `NY`, `ME`); head-of-household and separate-filer standard deductions outside the federal-conforming states are derived (1.5x single, joint/2). Top-level `withholding` is federal-only: `breakdown.state.withholding` carries state withholding, and `netTaxPayable` subtracts both. `stateDependents`, `stateWithholding`, and `stateCredits` require a `state` code and throw otherwise. Separate filers use half the joint thresholds in `MN` and `WI`; `MO` joint returns use doubled single thresholds (each spouse taxed on half). Known gaps: Utah's credit phase-out, Connecticut/Illinois/Maryland/Oregon/Rhode Island/Wisconsin income-tested phase-outs, the Maryland capital-gains and Minnesota net-investment-income surtaxes, and Maine's 2026 high-income surcharge are not modeled; New York uses the 2025 return rate schedule; Nebraska head-of-household uses the single schedule; head-of-household brackets outside the states listed in the parameter tables fall back to the single schedule. Local/city income taxes, state itemized deductions, and income-tested phase-outs not encoded in the parameter tables are out of scope.

## Thailand Levy for sim-core

`@trajectonomics/tax/th` exports `emitThLevy(profile)`, which freezes one TH 2026 taxpayer profile into a [sim-core](https://github.com/trajectonomics/sim-core) `Levy`. The emitted graph uses only `const`, `tally`, `add`, `sub`, `min`, `max`, `scale`, and `pick`, so sim-core evaluates it in exact integer satang without importing this package. The dependency points this way only: the package takes a dev-dependency on `@trajectonomics/sim` for its golden corpus.

The profile fixes the filing status, the fixed allowances (personal, spouse, children, parents, disabled care, social security, life/health insurance, parent health insurance, spouse life insurance, mortgage interest, and donation requests), the standard-versus-actual expense elections, the Section 40(4) final-withholding elections with the Section 47 bis corporate rate, and the Levy identity (`id` defaults to `th-2026-pit`, period to 1 January, settlement to 31 March). Income, expense, and contribution amounts are not in the profile: they arrive as Flow tallies under the labels below.

`Levy.due` is the audited `tax.net_payable` Measure: regular tax (the larger of the progressive brackets and the Section 48(2) minimum gross tax) plus final withholding tax, less the final withholding and Section 47 bis credits. It equals `calculateThTax(...).netTaxPayable` when the input carries no Section 48(5) separate sheet, no Section 48(4) real estate transfer, and no other withholding. Payroll withholding is out of scope: the caller puts `prepaymentBps` on its Flows and the Settlement corrects it.

Audited Measure ids are exported as `ThLevyMeasureId` (`assessable.total`, `expenses.total`, `allowances.total`, `taxable.income`, `tax.progressive`, `tax.minimum`, `tax.regular`, `tax.final_withholding`, `credit.dividend`, `tax.total`, `tax.net_payable`).

```ts
import { emitThLevy, ThLevyIncomeLabel } from "@trajectonomics/tax/th"

const levy = emitThLevy({ filingStatus: "single", allowances: { children: { totalCount: 1 } } })
// Label income Flows with ThLevyIncomeLabel values and contribution Flows with
// ThLevyContributionLabel values; sim-core tallies them and settles `levy.due`.
```

### Income tally labels (`gross` basis)

| Label | Income class |
| --- | --- |
| `income.section40_1` | Section 40(1) employment |
| `income.section40_2` | Section 40(2) service and hire of work |
| `income.section40_3` | Section 40(3) royalties, goodwill, copyright |
| `income.section40_4` | Section 40(4) income with no source election |
| `income.section40_4.interest` | Section 40(4) interest |
| `income.section40_4.dividends` | Section 40(4) dividends |
| `income.section40_4.digitalAssets` | Section 40(4) digital asset income |
| `income.section40_5.building` | Section 40(5) building rental |
| `income.section40_5.agriculturalLand` | Section 40(5) agricultural land rental |
| `income.section40_5.nonAgriculturalLand` | Section 40(5) non-agricultural land rental |
| `income.section40_5.vehicles` | Section 40(5) vehicle rental |
| `income.section40_5.other` | Section 40(5) other rental |
| `income.section40_6.medical` | Section 40(6) medical profession |
| `income.section40_6.law` | Section 40(6) law profession |
| `income.section40_6.engineering` | Section 40(6) engineering profession |
| `income.section40_6.architecture` | Section 40(6) architecture profession |
| `income.section40_6.accounting` | Section 40(6) accounting profession |
| `income.section40_6.fineArts` | Section 40(6) fine arts profession |
| `income.section40_6.other` | Section 40(6) other liberal profession |
| `income.section40_7` | Section 40(7) contracting with materials |
| `income.section40_8.general` | Section 40(8) general business and commerce |
| `income.section40_8.entertainer` | Section 40(8) entertainer (tiered expense) |

Section 40(4) is split into four labels because each source carries its own final-withholding election; every other class is one label per Section 40 input field, so no income is pooled across different statutory expense rates.

### Contribution tally labels (`funded` basis)

| Label | Allowance |
| --- | --- |
| `allowance.retirement.rmf` | RMF contribution |
| `allowance.retirement.ssf` | SSF contribution |
| `allowance.retirement.pvd` | PVD contribution |
| `allowance.retirement.gpf` | GPF contribution |
| `allowance.retirement.nsf` | National Savings Fund contribution |
| `allowance.retirement.pension_life` | Pension life insurance premium |
| `allowance.thai_esg` | ThaiESG contribution |

The golden corpus in `src/th/tests/levy-golden.test.ts` generates over 3,000 deterministic cases — every bracket boundary, every expense and allowance ceiling on both sides, the minimum gross tax thresholds, and half-satang ties — and asserts that eleven audited Measures match `calculateThTax` to the satang for each one.

## Commands

- `bun run check`: Complete verification suite (`lint`, `typecheck`, `test` with 100% coverage, `build`, `lint:package`).
- `bun run build`: Build ESM and CJS bundles via `tsdown`.
- `bun test`: Run test suite with 100% coverage enforcement.
- `bun run typecheck`: Run strict TypeScript compiler checks.
- `bun run lint`: Lint with Biome (zero warnings allowed).
- `bun run format`: Auto-format and organize imports with Biome.
- `bun run lint:package`: Validate package manifests and type exports with `publint` and `@arethetypeswrong/cli`.

## Releasing

Versions are computed, never edited by hand (`package.json` says `0.0.0-development` on purpose). The shared publish workflow (`trajectonomics/cicd`) reads the last `vX.Y.Z` git tag and the conventional commit messages since then:

| Commits since last release | Bump |
| --- | --- |
| any `feat!:` / `fix!:` / `BREAKING CHANGE:` | major (minor while on 0.x) |
| any `feat:` | minor |
| anything else | patch |

- **Alpha, automatic:** Every merge to `main` that touches code publishes `<next>-alpha.<n>` under the npm dist-tag `alpha` (`bun add @trajectonomics/tax@alpha`). `n` counts up per upcoming version.
- **Stable, on demand:** Actions → Release → Run workflow (on `main`). It publishes `<next>` under `latest`, tags `vX.Y.Z`, and creates a GitHub release with generated notes. The bump input overrides the computed one; pick `major` to cut 1.0.0.

PR titles must be conventional commits (enforced by the `PR title` check) because squash-merge commit subjects become the basis for version calculation.

## License

MIT
