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
8. Never use `gemini-3.8-flash` anywhere; use `gemini-4-hydrogen` instead for Antigravity tasks and reviews (and `gemini-4-argon` where configured).
9. Temporary files and scratch clones: `/tmp` is a shared, nearly full tmpfs. Never use fixed `/tmp` filenames (use `mktemp`, or `--body-file -` for `gh` bodies), and never install `node_modules` or clone scratch repositories under `/tmp`; use `~/.cache/<slug>`.

## Organisation goals

The organisation's goals are in https://github.com/trajectonomics/goals, `GOALS.md`. Read them before proposing a new direction. Only the owner edits that file; never edit it.

## Owner

Saving the owner's attention is part of the job, so finish a task instead of asking about it.

- Finish end-to-end: commit, push, open the PR, get an independent review, `gh pr merge` when the work is green or the owner said to proceed, then do the follow-up steps the change implies. Do not stop for small permission questions, and do not end with a `## Not done yet` list.
- When unsure, consult subagents on other models (`claude-sonnet-5-5`, `gemini-4-hydrogen`, `gemini-4-argon`, `deepseek-v4.1-flash`) instead of asking the owner. The model rules above still decide which one a session may itself run.
- Verify before calling something blocked: read live GitHub state (`gh issue view`, `gh pr view`) and the real CLI/API schema first.
- Keep replies short and lead with what only the owner must do; add detail when asked.
- Record every durable lesson here or in `docs/`, never only in agent memory.
- Settle your own T3 thread (`t3_thread_organize`, `action: "settle"`) when the work is done and nothing waits on the owner.

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

## Factory Runs

A Factory Run or Spec drafter (a thread titled `traj/trajectonomics/<repo>#<n>` or `triage/trajectonomics/<repo>#<n>`) takes its instructions from the Dispatcher runbook in `trajectonomics/factory`, never from this repository, where `docs/dispatcher-runbook.md` does not exist. Read it with `gh api repos/trajectonomics/factory/contents/docs/dispatcher-runbook.md -H "Accept: application/vnd.github.raw"`. If you cannot read it, stop and say so; do not build from the issue alone.
