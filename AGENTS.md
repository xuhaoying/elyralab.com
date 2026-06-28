# Agent Working Rules

## Core Principle

Work in small, safe, atomic checkpoints. Do not make large unrelated changes in one batch.

Before starting any task:

1. Run `git status`.
2. Confirm whether the working tree is clean.
3. If there are existing changes, inspect them before editing.
4. Do not overwrite or discard existing work unless explicitly instructed.

## Checkpoint Workflow

For each logical change:

1. Make only one complete logical change at a time.
2. Keep the diff small and reviewable.
3. Run the relevant checks after the change.
4. Show a brief git diff summary.
5. Commit the change with a clear commit message.
6. Only then continue to the next checkpoint.

A logical change can be:

- Fixing one bug
- Adding one page
- Updating one component
- Improving one group of SEO metadata
- Adding one API endpoint
- Refactoring one small module
- Updating one template or content pattern

Do not combine unrelated changes in one commit.

## Safety Rules

Do not:

- Rewrite large parts of the codebase without asking.
- Mix UI, data model, SEO, copywriting, and deployment changes in one batch.
- Continue for a long time without committing.
- Run destructive commands without explicit approval.
- Force push.
- Delete files unless clearly necessary and explained.
- Overwrite existing user changes.

If interrupted or reconnected:

1. Treat the previous session as stale.
2. Run `git status`.
3. Run `git diff`.
4. Summarize the current state from disk.
5. Continue from the safest checkpoint.

## Commit Rules

Commit after each safe checkpoint.

Use clear commit messages, for example:

- `fix: repair sitemap generation`
- `feat: add pricing calculator page`
- `seo: improve metadata for tool pages`
- `refactor: simplify calculator form state`
- `content: update landing page copy`

Commit does not mean push.

Only push when explicitly instructed or when the task says to deploy.
