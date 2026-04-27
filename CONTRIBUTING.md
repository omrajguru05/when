# Contributing to WHEN

WHEN is open source because scheduling infrastructure should be owned by the people who use it. Every contribution, whether it fixes a typo or introduces a new capability, matters.

This document exists so that contributing feels straightforward, not ceremonial.

---

## Before You Begin

Read [`README.md`](README.md) to understand what WHEN is and what it is not. Read [`CLAUDE.md`](CLAUDE.md) before touching any UI. The design system is intentional. Deviating from it introduces inconsistency that is hard to undo.

For security issues, do not open a public issue. Follow the process in [`SECURITY.md`](SECURITY.md).

---

## What We Welcome

- Bug fixes
- Performance improvements
- Documentation corrections
- New features that align with the project's scope
- Tests

If you are unsure whether something belongs in WHEN, open an issue first. A quick conversation saves everyone time.

---

## The Golden Constraint

WHEN runs on Vercel's Hobby plan. The hard limit is **12 serverless functions**. The project currently uses 11.

Every pull request that adds a route handler must justify it. Prefer collapsing CRUD into an existing file. One file is one function on Vercel. This is not a suggestion.

---

## Getting Started

**Prerequisites:** Node 18 or later.

```bash
git clone https://github.com/omrajguru05/when.git
cd when
cp .env.example .env.local
npm install
npm run dev
```

Fill in `.env.local` before starting the dev server. The app will not work without valid Supabase credentials. Refer to the [Self-hosting in 5 minutes](README.md#self-hosting-in-5-minutes) section for setup instructions.

For Supabase auth to work locally, add `http://localhost:3000/auth/callback` to the Redirect URLs allowlist in your Supabase project settings.

---

## Making Changes

### Open an issue first

For anything beyond a trivial fix, open an issue and describe what you are building and why. This prevents duplicate effort and ensures the direction is right before code is written.

### Branch naming

Branch names should communicate intent clearly.

| Type | Example |
|---|---|
| Feature | `feat/recurring-events` |
| Bug fix | `fix/slot-overlap-edge-case` |
| Documentation | `docs/update-env-table` |
| Refactor | `refactor/slots-engine` |

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/).

```
feat: add buffer time to slot computation
fix: correct timezone offset for DST transitions
docs: clarify Vercel function count in README
refactor: extract email template logic into shared util
```

Keep the subject line under 72 characters. Use the body to explain the why, not the what.

---

## Before You Open a Pull Request

Run all four checks. All must pass.

```bash
npm run typecheck
npm run lint
npm run build
```

If your change touches the skeleton loading system, regenerate bones:

```bash
npm run dev     # in one terminal
npm run bones   # in another
```

### UI changes

Every visual change must follow `CLAUDE.md` exactly. Use the existing component primitives. Do not introduce ad-hoc Tailwind classes for values already covered by a CSS variable. Do not hardcode hex values. All animations must respect `prefers-reduced-motion`.

### Data changes

New database schema goes in a new migration file under `supabase/migrations/`. Never edit `0001_initial_schema.sql`. New environment variables must appear in `.env.example` and in the Environment variables table in `README.md`.

### TypeScript

Strict mode is non-negotiable. Avoid `any`. If you are wrapping an external SDK and `any` is unavoidable, add a comment explaining why.

---

## Pull Request Standards

A good pull request has:

- A clear title using the same Conventional Commits format as your commits
- A description that explains what changed, why it changed, and how it was tested
- A note on Vercel function count if a new route handler was added
- No unrelated changes bundled in

Small, focused pull requests are easier to review and faster to merge. Large pull requests slow everything down.

---

## Code of Conduct

Treat every contributor with respect. Disagreements about technical direction are normal and productive. Personal attacks are not. Contributors who cannot engage constructively will be removed from the project.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
