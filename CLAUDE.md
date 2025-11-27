# CLAUDE.md

This repository uses `WARP.md` as the single source of truth for project-specific rules and architecture.

## How to use this file

- On every interaction, first read `WARP.md` in the repo root.
- Treat the instructions and context in `WARP.md` as higher priority than any generic or global rules you may have for this project.
- When in doubt about commands, architecture, or product constraints, prefer the information in `WARP.md`.

## Project-specific guidance for Claude

- Always load and follow `WARP.md` before making code changes or suggesting workflows.
- If you notice discrepancies between the actual code and `WARP.md`, point them out and (if asked) propose updates to `WARP.md` to keep it in sync.
- When adding new tooling (tests, linters, scripts, etc.), update `WARP.md` with the relevant commands so future tools and agents stay aligned.
