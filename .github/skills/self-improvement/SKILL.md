---
name: self-improvement
description: "Capture errors, corrections, and recurring learnings for continuous improvement. Use when: command fails, user corrects the assistant, a tool/integration breaks, a requested capability is missing, or a better repeatable approach is discovered."
---

# Self-Improvement Skill

Use this skill to log useful learning signals during development.

## When to use

- A command or operation fails unexpectedly.
- The user corrects the assistant.
- A capability is requested but not available yet.
- An external API/tool integration fails.
- A better approach is found for a recurring task.

## Setup (first use)

Create the learning log files at project root if missing:

```bash
mkdir -p .learnings
[ -f .learnings/LEARNINGS.md ] || printf "# Learnings\n\nCorrections and insights captured during development.\n\n---\n" > .learnings/LEARNINGS.md
[ -f .learnings/ERRORS.md ] || printf "# Errors\n\nFailures and integration issues.\n\n---\n" > .learnings/ERRORS.md
[ -f .learnings/FEATURE_REQUESTS.md ] || printf "# Feature Requests\n\nRequested capabilities to track.\n\n---\n" > .learnings/FEATURE_REQUESTS.md
```

Never log secrets, tokens, private keys, or full sensitive output.

## Quick actions

- Log failures to `.learnings/ERRORS.md`.
- Log corrections and best practices to `.learnings/LEARNINGS.md`.
- Log missing capabilities to `.learnings/FEATURE_REQUESTS.md`.
- Promote stable learnings to workspace instructions when broadly useful.

## Entry format

Use IDs with date and sequence:

- `LRN-YYYYMMDD-001`
- `ERR-YYYYMMDD-001`
- `FEAT-YYYYMMDD-001`

Keep entries short and actionable:

- Summary
- Context
- Suggested action
- Related files
