# AGENTS.md

Instructions for AI coding agents in `trajectonomics/tax-core` (`@trajectonomics/tax` on npm).

## Rules

1. Never commit to `main`. Branch (`feat/*`, `fix/*`, `docs/*`) and open a PR.
2. Never commit secrets or `.env` files. `NPM_TOKEN` lives in repo secrets only.
3. Pure package: no network, DOM, framework imports, or locale/timezone logic. The tax year is a constant per system, never derived from `Date`. `tsconfig.json` compiles `src` with no DOM, Node, or Bun types, so `fetch`/`process`/`document` fail typecheck; do not add `types` or `lib` entries to get around it.
4. Bun only: `bun install`, `bun test`, `bun run <script>`. Do not add npm/pnpm/yarn lockfiles.
5. Done means `bun run check` passes:
   - Biome lint with zero warnings.
   - File length limits: max 100 lines per source file, max 200 lines per test file (enforced by Biome).
   - Cognitive complexity: max 10 per function (enforced by Biome).
   - Strict isolatedDeclarations typecheck (`tsc -p tsconfig.json && tsc -p tsconfig.test.json`).
   - Test suite with **100.00% line coverage** threshold (`scripts/check-coverage.ts`).
   - Zero hardcoded strings or diagnostic literals: stages must consume typed field enums and parameters, never raw diagnostic string literals or raw currency strings (`scripts/check-no-hardcoded-strings.ts`).
   - Clean package build (`tsdown`), strict packaging (`publint --strict`), and node16 type checks (`attw`).
   - Run `bun run format` to auto-fix formatting and imports. Do not loosen `tsconfig.base.json` or `biome.json` to make an error go away.
6. Never edit `version` in `package.json` and never run `npm publish` locally. Merges to `main` publish alphas; a stable release is the manual Release workflow. PR titles are conventional commits (`feat:`, `fix:`, `feat!:` ...) because they decide the next version (see README "Releasing").
7. Pi (`pi.dev`) model restriction: When running the Pi coding agent (`pi.dev`), strictly use **DeepSeek 4.1 Flash** only (e.g., `deepseek/deepseek-v4.1-flash`, `deepseek/deepseek-v4.1-flash-fast`), whether routed via Command Code GOAT (`command-code`) or OpenCode Go (`opencode`). Do not switch to or run any other models (Claude, GPT, Gemini, etc.) in Pi sessions for this repository. This rule is mechanically enforced via `.pi/settings.json`.


## Statutory Architecture Standards

When implementing statutory rules (e.g. Thailand PIT, US Federal):
1. **Parameters as data**: Statutory amounts, rates, allowances, and brackets live in `parameters.ts` per tax year as typed constants (e.g. `TH_2026_PARAMETERS`). Never inline hardcoded numbers into logic functions.
2. **One rule per file**: Keep statutory deduction, allowance, and expense calculations as pure functions in dedicated files under 100 lines, returning `{ value, breakdown }`.
3. **Staged pipeline**: Wire calculations into an ordered statutory stage pipeline: `assessable` -> `expenses` -> `allowances` -> `brackets` -> `credits` -> `result`. Avoid complex dynamic DAG solvers.
4. **Typed field enums & no raw strings**: Diagnostic field paths and breakdown keys (`ThAssessableField`, `ThExpenseField`, `ThAllowanceField`, `ThBracketField`, `ThTaxField`) and currency codes (`parameters.currency`) must be typed enums/constants. Never pass raw string literals (`"expense.*"`, `"THB"`, etc.) in stages. Enforced statically by `scripts/check-no-hardcoded-strings.ts`.
5. **1:1 Stage-to-test mapping**: Never combine multiple stages or categories into a single merged test file. Each calculation stage file in `src/<jurisdiction>/stages/` must have a dedicated 1:1 unit test file in `src/<jurisdiction>/tests/` under 200 lines.
6. **Minor-unit safety & currency threading**: Caps and percentage calculations (`clampCap`, `resolveCap`) must thread the target `currency` or convert safely using integer minor units (`toMinorUnits` / `fromMinorUnits`). Never execute raw integer checks on major units that can have decimals (e.g. fractional satang/cents).
7. **Chronological order independence**: Any multi-item rule dependent on dates or birth years (e.g. child bonus born >= 2018) must sort entries chronologically before index-based evaluations, independent of input array ordering.
8. **Strict input bounds & safe integers**: Validate monetary amounts, rates, and count fields (children, parents, disabled persons). Counts must be non-negative safe integers; sub-counts (e.g. 2nd+ child bonus) must be validated or clamped against total counts (`Math.min(bonus, Math.max(0, count - 1))`).
9. **Documentation (TSDoc)**: Every exported function, type, and rule must carry a concise TSDoc comment detailing **Purpose**, **Math**, **Units** (major vs integer minor units), **Throws**, and statutory citation (`@statute`).
10. **Statutory reference cross-validation**: All statutory calculators must be cross-validated against official reference sources or government-recognized filing calculators (e.g. Raidaai for Thai PIT ภ.ง.ด. 90/91) across regular, edge, and combined test cases before submitting.

## Agent skills

### Issue tracker

GitHub Issues in `trajectonomics/tax-core`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Installing and updating skills

Skills come from [`mattpocock/skills`](https://github.com/mattpocock/skills) and [`trajectonomics/internal-skills`](https://github.com/trajectonomics/internal-skills) via the Vercel [`skills`](https://github.com/vercel-labs/skills) CLI and are pinned in `skills-lock.json`. The canonical copy is `.agents/skills/` (read natively by Codex, OpenCode, Pi, and Antigravity CLI); `.claude/skills/` holds symlinks into it for Claude Code. Never edit them by hand.

- Update: `npx skills update -p -y`
- Reinstall: `npx skills add mattpocock/skills --skill '*' -a claude-code codex opencode antigravity-cli pi -y`
- Restore from the lock: `npx skills experimental_install`
