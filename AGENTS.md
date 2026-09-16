# AGENTS.md — extension-tao-testqti (taoQtiTest)

## Purpose

`oat-sa/extension-tao-testqti` (extension id `taoQtiTest`) is the QTI **Test** implementation: Test Creator, compilation, test-runner boot (session/timers/plugins), CAT hooks, and result transmission. It implements `taoTests` and feeds delivery/proctoring.

It is **not** the Tests library (`taoTests`), proctor monitor (`taoProctoring`), or delivery publish UI (`taoDeliveryRdf`).

## Shared platform agent rules

Common readiness / context-budget / Definition of Done / family anti-patterns /
verify-by-change-type conventions for TAO PHP extensions live in the installed
**`tao`** package (`oat-sa/tao-core`) `AGENTS.md`. Read that file when present
in the platform install.

This file covers **only** ownership and workflows specific to this package.
Do **not** require any external monorepo checkout or workstation-only note paths.


## Stack

Do **not** hardcode dependency or runtime versions in this file.

- PHP: qtism, `lib-test-cat`, tao-core, items/tests deps (see `composer.json`)
- Dual PHP layouts may exist: legacy `actions/` + `models/classes/` and newer `model/` — follow the nearest file
- FE: Creator + runner boot; npm `@oat-sa/tao-test-runner` / `tao-test-runner-qti`
- Optional `doc/swagger.json` for REST — update when APIs change
- Versions from composer / package.json / CI only

## Core Rules

- **Follow existing patterns first** in this package.
- **Prefer TDD** for behavior changes unless docs/config-only.
- **Prefer minimal, local changes.** No broad refactors unless requested.
- **Preserve license headers** — sibling-style **`GPL-2.0-only`** (see `composer.json`); do not auto-migrate to SPDX dual-license.
- **Update tests** when behavior changes.
- **Do not weaken** CI / lint / test / CodeRabbit gates.
- For shared agent discipline (context budget, DoD, family anti-patterns), follow the installed **`tao`** (`oat-sa/tao-core`) `AGENTS.md`.


## Structure

```text
manifest.php
actions/                 # Runner, Creator, …
models/classes/  and/or  model/
views/js/controller/creator/
views/js/controller/runner/
views/js/loader/         # taoQtiTestRunner.min.js, testPlugins.min.js, …
doc/swagger.json         # if present
test/
```

## UI layer

| Surface | Own? | Where |
|---------|------|--------|
| QTI Test Creator / XML editor | **Yes** | `controller/creator`, content editors |
| Tests library | **No** | `taoTests` |
| Test runner engine | **Boot Yes** / **Engine npm** | `@oat-sa/tao-test-runner*` |
| Proctor monitor | **No** | `taoProctoring` |
| Delivery publish | **No** | `taoDeliveryRdf` |

## Conventions

- Prefer modern runner/plugin registration scripts (`RegisterTestRunner*`) over mixing patterns into legacy `testRunner/` without an explicit ask.
- Sync structures/routes/PHP for Creator screens.
- Do not hand-edit generated runner/plugin bundles.
- When changing REST APIs, update Swagger if this repo maintains it.

## Testing

- PHPUnit from platform root on `taoQtiTest/test/...`.
- FE grunt eslint/test/bundle with `--extension=taoQtiTest` for JS changes.

Discover the **platform root** (Composer application with `vendor/bin/phpunit`) from the environment — do not assume a particular monorepo path.

## Commands

```bash
./vendor/bin/phpunit -c phpunit.xml.dist taoQtiTest/test
npx grunt taobundle --extension=taoQtiTest
npx grunt eslint:extensionreport --extension=taoQtiTest --force
npx grunt taotest --extension=taoQtiTest
```

## Hard rules / Constraints

- Do not vendor test-runner engines; fix npm packages when the bug is in the engine.
- Do not add Resource Manager forks.
- Preserve delivery/proctoring session contracts when touching runner APIs.
- Never commit `.ai/` or `.cursor/`.

## Anti-patterns

- Mix legacy and modern runner patterns in one opportunistic patch.
- Hand-edit `*.min.js`.
- Break assembly/publish contracts relied on by `taoDeliveryRdf` without coordination.

Also follow family anti-patterns in the installed **`tao`** (`oat-sa/tao-core`) `AGENTS.md`.

## Agent notes (`.ai/`)

Local, **gitignored** branch-scoped notes. Do **not** commit `.ai/`. Durable
rules stay in this file and in tao-core `AGENTS.md` for shared conventions.

Write a **polar-star** under `.ai/work/<slug>/` plus supporting docs; prefer
re-reading those files over chat-only memory.

```text
.ai/work/<branch-slug>/   # injective: `%`→`%25`, `_`→`%5F`, `/`→`_`
.ai/current                # symlink to active work dir
.ai/archive/*.tar.gz
```

Enable once per clone:

```bash
git config core.hooksPath .githooks
```

After `git branch -d` / prune: `scripts/ai-notes-gc.sh`  
Optional: `scripts/ai-notes-gc.sh --self-test`.


## Definition of Done

Satisfy **tao-core** Definition of Done / Readiness conventions when available, plus this package’s Hard rules. Minimal local checklist:

1. Package-specific AC / polar-star addressed.
2. Diff stays in this package unless the task requires otherwise.
3. TDD evidence for behavior changes (or docs/config-only exception).
4. License headers updated (`GPL-2.0-only` sibling style).
5. `.ai/` notes updated when decisions matter.
6. `pr-ready-gate` (or tao-core readiness fallback) passed with real command output.

## Skills ([oat-sa/skills](https://github.com/oat-sa/skills))

1. Search / load skills from **[oat-sa/skills](https://github.com/oat-sa/skills)** first.
2. Prefer reusing shared skills over inventing a parallel local skill.
3. Create a new skill only when nothing suitable exists.

**Must-have for implementation / PR prep:** [`pr-ready-gate`](https://github.com/oat-sa/skills/tree/feat/pr-ready-gate/pr-ready-gate)
(branch pin while testing). If the skill cannot be loaded, use the same criteria
as **`tao` / tao-core AGENTS Readiness gate**: tests + lint on touched scope +
local CodeRabbit with **zero critical / zero major**.

## Readiness gate (before “done” / before opening a PR)

Prefer skill `pr-ready-gate`. Fallback: follow **tao-core** `AGENTS.md` Readiness
gate / Definition of Done, plus this package’s Hard rules. Report real command
results. Docs / hooks / `AGENTS.md`-only changes: `bash -n` on touched shell +
CodeRabbit on the diff; skip irrelevant suites explicitly.


## Pointers

- `README.md` — package overview
- `composer.json` / `LICENSE` — license and Composer deps
- `views/package.json` — FE pins (if present)
- Installed **`tao`** package `AGENTS.md` (`oat-sa/tao-core`) — shared agent conventions
- [oat-sa/skills](https://github.com/oat-sa/skills) — shared skills; [`pr-ready-gate`](https://github.com/oat-sa/skills/tree/feat/pr-ready-gate/pr-ready-gate) (branch pin while testing)
- `.coderabbit.yaml` → remote `oat-sa/tao-code-quality` `coderabbit/php/authoring/v1`
- `.github/workflows/*` — PR CI
- `.githooks/post-checkout` + `scripts/ai-notes-gc.sh` — local `.ai/` lifecycle

## Default Agent Behavior

1. Read this file, then `.ai/current` / polar-star for the branch.
2. Read installed **`tao`** (`oat-sa/tao-core`) `AGENTS.md` for shared gates when available.
3. Check [oat-sa/skills](https://github.com/oat-sa/skills) before inventing procedures; use `pr-ready-gate` for implementation/PR prep.
4. Prefer TDD; keep diffs minimal and inside this package.
5. Respect UI/ownership tables above; avoid Anti-patterns.
6. Update `.ai/` as decisions land; verify with platform-root commands; do not weaken CI.
