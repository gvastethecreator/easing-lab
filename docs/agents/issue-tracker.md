# Project tracker: Local Markdown

PRDs, tickets, triage records, and project decisions for this repo live as Markdown files in `.scratch/`. Remote issue trackers are read-only sources, not destinations.

## Project layout

- Project root: `.scratch/easing-lab/`
- PRD: `.scratch/easing-lab/PRD.md`
- Compact queue: `.scratch/easing-lab/tickets.md`
- Per-ticket lifecycle files: `.scratch/easing-lab/issues/<NN>-<slug>.md`
- Rejected requests: `.scratch/easing-lab/out-of-scope/<concept>.md`
- Execution plans: `.scratch/planning/`
- Architecture audits: `.scratch/architecture/`

Issue files keep `Category:` and `Status:` near the top. Comments and history append below `## Comments`.

## Remote references

GitHub issues, URLs, bodies, comments, and PRs may be read as source material. Record a source URL or ref in the local artifact. Do not create, edit, label, comment on, or close remote issues from this workflow.
