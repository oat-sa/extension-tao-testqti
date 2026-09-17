# AGENTS.md — extension-tao-testqti (taoQtiTest)

> Shared pillars (standards, quality / `pr-ready-gate`, Make, commit/PR):
> [nextgen-stack `tao/AGENTS.md`](https://github.com/oat-sa/nextgen-stack/blob/main/tao/AGENTS.md)
> · local: [`../AGENTS.md`](../AGENTS.md).

## 01 — Project Context

**What / why:** `oat-sa/extension-tao-testqti` (id `taoQtiTest`) is the QTI
**Test** stack: Creator, compilation, test-runner boot (session/timers/plugins),
CAT hooks, results. Implements `taoTests` and feeds delivery/proctoring.

**Not:** Tests library, proctor monitor, or delivery publish.

**Key directories / stack / constraints:**

```text
manifest.php
actions/                 # Runner, Creator, …
models/classes/  and/or  model/   # dual layouts — follow nearest file
views/js/controller/creator/
views/js/controller/runner/
views/js/loader/         # generated runner/plugin bundles
doc/swagger.json         # if present — update when REST changes
test/
```

- Stack: PHP qtism / `lib-test-cat` / tao-core; FE Creator + runner boot; npm
  `@oat-sa/tao-test-runner*`.
- Versions from manifests/CI only.

**Docs:** [`README.md`](README.md). Shared docs / decision-log rules → parent AGENTS.

## 02 — Standards & Conventions

Package-only below. Family patterns, quality SoT, `pr-ready-gate`, polar-star →
**parent AGENTS**.

**Patterns / structure:**

- Prefer modern `RegisterTestRunner*` over mixing legacy `testRunner/` casually.
- Preserve delivery/proctoring session contracts.

**Never do (this package):**

- Vendor runner engines; break assembly contracts for `taoDeliveryRdf`.
- Hand-edit loaders; RM forks.

**Ownership**

| Surface | Own? |
|---------|------|
| QTI Test Creator / XML editor | **Yes** |
| Tests library | **No** |
| Test runner engine | **Boot Yes** / **Engine npm** |
| Proctor / Delivery publish | **No** |

## 03 — Build & Test Commands

Shared Make / CI / readiness / commit policy → **parent AGENTS**
([commit/PR policy](https://oat-sa.atlassian.net/wiki/x/_oXmqQ)).

**This package** (from Composer platform root):

```bash
./vendor/bin/phpunit -c phpunit.xml.dist taoQtiTest/test
npx grunt eslint:extensionreport --extension=taoQtiTest --force
npx grunt taobundle --extension=taoQtiTest
```
