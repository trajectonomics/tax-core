# @trajectonomics/tax

Pure, deterministic statutory tax calculation engine with subpaths for Thailand (`@trajectonomics/tax/th`) and the United States (`@trajectonomics/tax/us`), covering 2026 federal tax plus all 50 state income tax systems and the District of Columbia.

## United States State Tax

`calculateUsTax` accepts an optional `state` code (`AL` through `WY` plus `DC`). When present, the result includes `breakdown.state` with state taxable income, bracket slices, personal/dependent credits, state withholding, and net state tax, and the state liability is folded into the top-level `totalTax` and `netTaxPayable`.

- Nine no-income-tax states (`AK`, `FL`, `NV`, `NH`, `SD`, `TN`, `TX`, `WA`, `WY`) return zero state tax and zero state rates.
- Sixteen flat-rate states (including `LA` and `OH`, which are single-rate in 2026) and twenty-five graduated-rate states plus `DC` use their 2026 standard deductions, personal/dependent exemptions, and statutory bracket tables.
- `MA` includes the 4% millionaire surtax and `CA` includes the 1% mental health services surtax.
- State inputs also include `stateDependents`, `stateWithholding`, and `stateCredits` (`nonRefundable` / `refundable`).
- State calculations start from federal AGI and apply the state standard deduction, personal/dependent exemptions or credits, and the state bracket table. Top-level `marginalRate` is the federal ordinary rate plus the state marginal rate. Head-of-household uses the state's joint schedule in `NJ`, `OR`, and `OK` and the single schedule elsewhere unless a dedicated table is encoded (`CA`, `MN`, `NY`, `ME`); head-of-household and separate-filer standard deductions outside the federal-conforming states are derived (1.5x single, joint/2). Top-level `withholding` is federal-only: `breakdown.state.withholding` carries state withholding, and `netTaxPayable` subtracts both. `stateDependents`, `stateWithholding`, and `stateCredits` require a `state` code and throw otherwise. Separate filers use half the joint thresholds in `MN` and `WI`; `MO` joint returns use doubled single thresholds (each spouse taxed on half). Known gaps: Utah's credit phase-out, Connecticut/Illinois/Maryland/Oregon/Rhode Island/Wisconsin income-tested phase-outs, the Maryland capital-gains and Minnesota net-investment-income surtaxes, and Maine's 2026 high-income surcharge are not modeled; New York uses the 2025 return rate schedule; Nebraska head-of-household uses the single schedule; head-of-household brackets outside the states listed in the parameter tables fall back to the single schedule. Local/city income taxes, state itemized deductions, and income-tested phase-outs not encoded in the parameter tables are out of scope.

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
