# Task 1 Report — Dependency vulnerabilities (backend)

## Summary

Eliminated all 6 unresolved high-severity `npm audit --omit=dev` findings in
`apps/backend`. This required a Fastify v4 → v5 major version bump plus
matching major bumps of the eight `@fastify/*` plugins already in
`package.json`, because the vulnerable `fast-uri` chain is nested inside
`@fastify/ajv-compiler`/`fast-json-stringify`, both of which are only patched
starting with the Fastify v5 line (`@fastify/ajv-compiler@4.x`, which requires
`fast-uri@^3.0.0`; v4's line is pinned to `@fastify/ajv-compiler@^3.5.0` →
`fast-uri@^2.0.0`, and *all* 2.x releases fall inside the vulnerable range).

I did the major bump rather than escalate/stop, because:
- I confirmed via `npm view` that no non-breaking patched version existed on
  the v4 line (fastify's own `four` dist-tag, 4.29.1, still resolves the
  vulnerable `@fastify/ajv-compiler@3.6.0` → `fast-uri@2.4.0`).
- All 8 `@fastify/*` plugins already in use had v5-compatible majors
  available, each declaring `fastify-plugin@^5`/`^6` (consistent with Fastify
  v5), so the whole plugin surface could move in lockstep.
- I read the official Fastify v5 migration guide and cross-checked the
  codebase for every listed breaking-change pattern (`.listen()` variadic
  args, `reply.redirect()` old signature, `request.routerPath`/`routerMethod`,
  `request.connection`, `reply.getResponseTime()`, `reply.sent =`,
  `jsonShortHand`, versioning options, custom `logger` option). Only the
  custom-`logger` case and one TS type-inference change actually applied.
- After bumping, `tsc --noEmit` surfaced exactly 2 real code sites, the
  production build was clean, and the full 135-test suite (including
  session/cookie login+logout, staff-login rate-limiting, Google OAuth2
  plugin registration, and multipart file-upload tests) passed with zero
  warnings/deprecation notices in the output.

I judged this as within the "confident enough to proceed" bar rather than
"STOP and escalate," but flag it below for a second pair of eyes given the
auth-critical surface touched (session/cookie/oauth2/rate-limit/multipart all
bumped together).

## npm audit — before

`npm audit --omit=dev` (baseline, prod deps only):

```
fast-uri  <=3.1.3               (high) — nested in @fastify/ajv-compiler and fast-json-stringify
@fastify/ajv-compiler  3.1.0 - 3.6.0   (high, transitive via fastify)
fastify  <=5.8.2                (high, direct) — depends on vulnerable ajv-compiler/fast-json-stringify-compiler/fast-json-stringify
fast-json-stringify  3.1.0 - 6.0.0     (high, transitive)
@fastify/fast-json-stringify-compiler  3.0.0 - 5.0.0-pre.fv5.1  (high, transitive)
fast-xml-parser  5.9.3 - 5.10.0 (high, transitive via minio) — DOCTYPE entity-expansion DoS

6 high severity vulnerabilities
```

## npm audit — after

`npm audit --omit=dev`:

```
found 0 vulnerabilities
```

`npm audit` (full tree, including devDependencies — for completeness, not in
task scope):

```
esbuild  <=0.24.2  (moderate) — nested in vite, under @vitest/mocker/vite-node,
under vitest@<=3.2.5 and @vitest/coverage-v8@<=3.2.5 (both direct devDependencies)

6 vulnerabilities (3 moderate, 1 high, 2 critical)
```

This dev-only chain (vitest/vite/esbuild) is **not** part of this task's
baseline (baseline was explicitly `--omit=dev`, 6 high) and is unrelated to
the Fastify/fast-uri/fast-xml-parser findings this task targets. Fixing it
requires `vitest@4.x` (a separate, unrelated breaking major bump of the test
runner, out of scope per the "do not upgrade unrelated packages" constraint).
See "Accepted risk / follow-up" below.

## What changed

### 1. Fastify + plugin major bumps (the fix for all 6 findings)

`apps/backend/package.json`:

| package | before | after |
|---|---|---|
| `fastify` | `^4.28.1` | `^5.10.0` |
| `@fastify/cookie` | `^9.4.0` | `^11.1.2` |
| `@fastify/cors` | `^9.0.1` | `^11.3.0` |
| `@fastify/env` | `^4.4.0` | `^7.0.0` |
| `@fastify/helmet` | `^11.1.1` | `^13.1.0` |
| `@fastify/multipart` | `8.3.1` (exact) | `^10.1.0` |
| `@fastify/oauth2` | `^7.9.0` | `^8.2.0` |
| `@fastify/rate-limit` | `^9.1.0` | `^11.1.0` |
| `@fastify/session` | `^10.9.0` | `^11.1.2` |

Note on `@fastify/multipart`: git history shows it was originally `^10.0.0`
and was deliberately pinned down to the exact `8.3.1` in commit `463fc55`
(same commit that added attachment upload support) — almost certainly because
`@fastify/multipart@10.x` requires Fastify v5 and the app was on Fastify v4
at the time. Restoring it to the v10 line is consistent with, not a deviation
from, that original intent now that Fastify v5 is in place.

`apps/backend/src/app.ts` — two adaptations required by the v5 API, no
business logic changed:

1. `Fastify({ logger })` → `Fastify({ loggerInstance: logger })`. In v5, the
   `logger` option only accepts pino *options*; passing an already-built pino
   instance (as this codebase does, via `src/utils/logger.ts`, which
   configures redaction of secrets) now throws `FST_ERR_LOG_INVALID_LOGGER_CONFIG`
   at startup unless passed via the new `loggerInstance` key. Verified fine
   via `node_modules/fastify/lib/logger-factory.js`, and confirmed at runtime
   — structured pino logs are emitted correctly throughout the test run.
2. `app.setErrorHandler((error, ...))` → `app.setErrorHandler<FastifyError>((error, ...))`.
   In v5 the `TError` generic on `setErrorHandler` defaults to `unknown`
   (previously it behaved like `FastifyError`), so `error.validation`,
   `error.name`, `error.stack` no longer type-checked. Explicitly typing the
   handler with `FastifyError` (which fastify's own types augment with
   `validation`/`validationContext`) restores the original typing with no
   runtime behavior change — this is a compile-time-only annotation.

`package-lock.json` — regenerated; diff is confined to the Fastify/plugin
dependency graph (avvio, find-my-way, ajv/ajv-formats, fast-json-stringify,
fast-uri, simple-oauth2/@hapi/boom for oauth2 v8, helmet, secure-json-parse,
etc.) plus the `fast-xml-parser` bump described below. No unrelated top-level
dependency (`zod`, `prisma`, `@prisma/client`, `pg`, `bcryptjs`,
`connect-pg-simple`, `pino`, `file-type`, `minio`) changed version.
`devDependencies` in `package.json` are untouched.

### 2. `fast-xml-parser` (the 6th finding, resolved separately)

Fixed by a plain `npm audit fix` (no `--force`) before the Fastify bump. This
package is a transitive dependency of `minio` (`fast-xml-parser: "^5.3.4"`),
so npm re-resolved it from the vulnerable `5.9.3` to the patched `5.10.1`
purely inside the lockfile — no `package.json` change, no `minio` version
change, no code change.

## Breaking-change audit performed for the Fastify v5 bump

Cross-checked the codebase against every item in the official
[Fastify v5 migration guide](https://github.com/fastify/fastify/blob/main/docs/Guides/Migration-Guide-V5.md):

- `.listen()` variadic args → already using the `{ port, host }` object form
  in `src/server.ts`. No change needed.
- `reply.redirect(code, url)` old signature → all 3 call sites in
  `src/routes/auth.ts` already call `reply.redirect(url)` (single arg,
  default 302). No change needed.
- `request.routerPath`/`routerMethod`/`routeConfig`/`routeSchema`,
  `request.context`/`reply.context` → not used anywhere in `src/`.
- `request.connection` → not used (no hits).
- `reply.getResponseTime()` → not used.
- `reply.sent = true` → not used.
- `jsonShortHand` / full-JSON-schema requirement for `querystring`/`params`/`body`
  → not applicable; this codebase validates input with Zod in route handlers,
  not via Fastify's built-in JSON-schema validator.
- `useSemicolonDelimiter` default flip → no query-string semicolon usage found.
- Custom `logger` option → **applied**, see above.
- `setErrorHandler` generic default → **applied**, see above.
- Node.js v20+ requirement → environment is running Node v26, satisfied.

## Full test suite results

`npm run test:local` (against the shared local Postgres test DB at
`localhost:5433`, via `prisma:push:test` first):

```
Test Files  18 passed (18)
     Tests  135 passed (135)
  Duration  ~89s
```

Ran twice (once mid-change, once as the final check) — both green, 135/135,
no warnings/errors/deprecation notices in stdout/stderr beyond the normal
structured request logs.

Also ran focused re-checks to specifically exercise every bumped plugin:
- `src/routes/auth.test.ts` (14 tests) — staff login/logout, session cookie
  issuance, staff-login rate limiting (429s via `@fastify/rate-limit`),
  Google OAuth2 test-callback route (`@fastify/oauth2` registers and
  responds), RBAC. All pass.
- `src/routes/attachments.test.ts` (6 tests) — file upload via
  `@fastify/multipart`. All pass.
- `npx tsc --noEmit` — clean, 0 errors (after the 2 app.ts fixes).
- `npm run build` — clean.

## Files changed

- `apps/backend/package.json` — 9 dependency version bumps (fastify + 8
  `@fastify/*` plugins), no devDependency changes.
- `apps/backend/package-lock.json` — regenerated (fastify/plugin dependency
  graph + fast-xml-parser fix).
- `apps/backend/src/app.ts` — `logger` → `loggerInstance`;
  `setErrorHandler<FastifyError>` type annotation. No logic change.

## Self-review

- **Completeness:** all 6 baseline findings resolved; `npm audit --omit=dev`
  is clean (0 vulnerabilities).
- **Quality:** changes are minimal and mechanical — two 1-line edits in
  `app.ts`, both required purely to satisfy the new Fastify v5 API contract
  (no behavior/logic change); dependency bumps are exactly the packages that
  needed to move, one exact-pin restored to caret range consistent with prior
  git history.
- **Discipline:** no unrelated packages touched — `zod`, `prisma`,
  `@prisma/client`, `pg`, `bcryptjs`, `connect-pg-simple`, `pino`,
  `file-type`, `minio`, and all `devDependencies` are untouched. No
  application/business logic changed.
- **Testing:** full 135-test suite passes; typecheck and build are clean;
  output has no warnings or deprecation notices.

## Concerns / accepted risk

1. **Fastify v5 + 8-plugin major bump, done inline rather than escalated.**
   This is the one item worth a second look given the brief's explicit "STOP
   and escalate if... you're unsure it's safe" guidance. I did the migration
   because I could positively verify (via the official migration guide, a
   source-level read of the specific breaking runtime change, and a
   security-relevant focused test run covering session/cookie/oauth2/
   rate-limit/multipart) that nothing in this codebase hit any breaking
   pattern except the two fixed. I did *not* have an actual Google OAuth
   consent-screen round trip to test against (the test suite only exercises
   the `test-google-callback` stub route, which confirms the plugin
   registers and its route responds, not a full live OAuth code exchange) —
   worth a manual smoke test of the real Google login flow in a lower
   environment before this ships to production, since that's the one code
   path the automated suite can't fully exercise.
2. **Dev-only `vitest`/`vite`/`esbuild` vulnerabilities (3 moderate, 1 high,
   2 critical under full `npm audit`, i.e. without `--omit=dev`) are
   pre-existing and out of scope.** Not part of this task's baseline (which
   was explicitly scoped to `--omit=dev`), and fixing them means bumping
   `vitest` to v4 (a separate, unrelated breaking change to the test runner).
   Recommend a follow-up task/ticket: **owner: backend team / re-check date:
   next quarterly dependency review (or whenever `vitest` v4 stabilizes and
   this repo's test files are updated for its breaking changes)**. Since
   these packages never ship to production (dev-only, build/test tooling),
   the practical exposure is limited to the local/CI dev environment, but it
   should not be left permanently undocumented.

## Verified

- [x] `npm audit --omit=dev` clean (0 vulnerabilities)
- [x] Full test suite passes (135/135)
