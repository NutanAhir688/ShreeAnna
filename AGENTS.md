# Antigravity & Agent Coding Rules for ShreeAnna

## 1. Git & Branching Guardrails
- **Pre-Change Rebase & Branching:** Before making any code changes or edits, ALWAYS pull the latest changes with rebase:
  ```bash
  git pull --rebase origin main
  ```
  Then immediately checkout to a new dedicated task branch:
  ```bash
  git checkout -b <type>/<task-name>
  ```
  **Never make code edits directly on `main` or `master`.**
- **Commit Only (Strictly No Push):** When changes are verified, stage and commit them locally (`git commit`). Strictly DO NOT run `git push` to remote. Pushing to remote is left to the user, or only when explicitly requested.
- **Dedicated Branch per Task:** Keep all features, fixes, and experiments on their own branches.

## 2. Development & Safety Constraints
- **No Mock Data:** Strictly avoid creating mock or placeholder data arrays. Always implement real data integration patterns or model mapping.
- **UI Components:** Use shadcn/ui components exclusively when building, styling, or scaffolding user interface elements.
- **Database Guardrails:** Never write code or execute operations that delete database records without explicitly prompting the user and obtaining consent first.
- **End-to-End Integration:** When creating or modifying features, always build the complete pipeline end-to-end (Database Schema -> Backend Controller/API -> Frontend Service Layer -> UI View Component). Never leave a feature half-implemented or hardcoded.
- **Sensitive Credentials:** Keep all API keys, tokens, and secrets in `.env` (with templates in `.env.example`). Never commit plaintext secrets to git.

## 3. Graphify Knowledge Graph
- Consult `graphify-out/` before broad codebase search.
- After modifying code files in a session, run `graphify update .` to keep the AST graph current.
