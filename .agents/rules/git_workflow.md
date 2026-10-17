---
trigger: always_on
description: Git workflow rules - pull with rebase, branch checkout before changes, commit only without pushing.
---

# Git Workflow & Branching Guardrails

## 1. Pre-Change Pull & Branching
- **Always Pull & Rebase First:** Before making any code edits or starting any task, ALWAYS pull latest updates from remote with rebase:
  ```bash
  git pull --rebase origin main
  ```
- **Checkout to a New Branch:** Always switch to a new, dedicated task or feature branch before modifying any code:
  ```bash
  git checkout -b <type>/<description>
  # Example: git checkout -b feature/farmer-auth-improvements
  ```
- **No Direct Edits on Main:** NEVER make code changes directly on `main` or `master`.

## 2. Commit Only (Never Push)
- **Commit Locally:** Once changes are verified and tested, stage and commit them locally with a clear and concise commit message:
  ```bash
  git add .
  git commit -m "<type>(<scope>): <summary>"
  ```
- **Do NOT Push:** NEVER run `git push` to remote automatically. Pushing is reserved for the user, or only when explicitly asked by the user in the prompt.
