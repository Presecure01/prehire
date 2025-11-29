# Repository Split Plan (Frontend vs Backend)

Goal: publish two independent GitHub repositories with preserved history using `git subtree`.

## Targets

| New Repo | Prefix in this repo | GitHub remote (create before pushing) |
|----------|--------------------|----------------------------------------|
| `prehire-frontend` | `frontend/` | `https://github.com/Presecure01/prehire-frontend.git` |
| `prehire-backend`  | `backend/`  | `https://github.com/Presecure01/prehire-backend.git` |

> `ai-service/` and other folders stay with the backend for now. Adjust prefixes/remotes here if that changes.

## Pre-checks

- From repo root: `git status` must be clean and branches up to date with origin.
- Ensure you have permissions to push to the target GitHub repos.
- Install `git subtree` (bundled with modern Git).

## Manual split commands (history-preserving)

```bash
# Run from repo root
git fetch origin
git status

# Frontend -> prehire-frontend
git subtree split --prefix=frontend -b split-frontend
git clone . ../prehire-frontend --branch split-frontend --single-branch
cd ../prehire-frontend
git remote remove origin
git remote add origin https://github.com/Presecure01/prehire-frontend.git
git push -u origin split-frontend:main

# Backend -> prehire-backend
cd ../prehire-app              # back to monorepo root
git subtree split --prefix=backend -b split-backend
git clone . ../prehire-backend --branch split-backend --single-branch
cd ../prehire-backend
git remote remove origin
git remote add origin https://github.com/Presecure01/prehire-backend.git
git push -u origin split-backend:main

# Cleanup local split branches in the monorepo (optional)
cd ../prehire-app
git branch -D split-frontend split-backend
```

Notes:
- `git subtree split` rewrites history to include only the chosen prefix, so commit history is preserved.
- The `../prehire-frontend` and `../prehire-backend` folders are disposable export folders; rename or move as needed.

## Scripted option

Instead of the manual steps, you can run the helper:

```bash
./scripts/split_repos.sh \
  --frontend-remote https://github.com/Presecure01/prehire-frontend.git \
  --backend-remote  https://github.com/Presecure01/prehire-backend.git
```

The script validates a clean tree, creates split branches, exports to `dist/prehire-frontend` and `dist/prehire-backend`, sets the remotes you pass, and pushes to `main`.

## Post-split follow-ups

- Update each repo README with stack-specific install/run instructions.
- Re-home shared secrets/CI variables into each GitHub repo.
- Decide whether to keep this monorepo as documentation/meta or archive it.
- Align issue trackers and PR workflows now that frontend/backend live separately.
