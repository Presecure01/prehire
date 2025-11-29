#!/usr/bin/env bash
set -euo pipefail

# Default configuration
FRONTEND_PREFIX="frontend"
BACKEND_PREFIX="backend"
DEVOPS_PREFIX="ai-service"
SHARED_PREFIX=""

FRONTEND_REMOTE=""
BACKEND_REMOTE=""
DEVOPS_REMOTE=""
SHARED_REMOTE=""

DIST_DIR="dist"

usage() {
  cat <<'EOF'
Usage: scripts/split_repos.sh [options]

Options:
  --frontend-remote <url>   Remote URL for the frontend repo (https or SSH). Push is skipped if empty.
  --backend-remote <url>    Remote URL for the backend repo.
  --devops-remote <url>     Remote URL for the devops/ai-service repo.
  --shared-prefix <path>    Optional additional prefix to export (e.g., shared/ or specs/).
  --shared-remote <url>     Remote URL for the shared repo (only used if --shared-prefix set).
  --dist-dir <path>         Destination folder for exported repos (default: dist).
  -h, --help                Show this message.

The script uses git subtree to create standalone repos (with history) for each prefix.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend-remote) FRONTEND_REMOTE="${2:-}"; shift 2 ;;
    --backend-remote) BACKEND_REMOTE="${2:-}"; shift 2 ;;
    --devops-remote) DEVOPS_REMOTE="${2:-}"; shift 2 ;;
    --shared-prefix) SHARED_PREFIX="${2:-}"; shift 2 ;;
    --shared-remote) SHARED_REMOTE="${2:-}"; shift 2 ;;
    --dist-dir) DIST_DIR="${2:-dist}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

if [[ -n "$SHARED_REMOTE" && -z "$SHARED_PREFIX" ]]; then
  echo "ERROR: --shared-remote requires --shared-prefix."
  exit 1
fi

if [[ ! -d .git ]]; then
  echo "ERROR: run this script from the repository root."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: working tree is dirty. Commit or stash changes before running the split."
  exit 1
fi

mkdir -p "$DIST_DIR"

split_and_push() {
  local name="$1"
  local prefix="$2"
  local remote="$3"

  if [[ -z "$prefix" ]]; then
    echo "Skipping $name: no prefix configured."
    return
  fi
  if [[ ! -d "$prefix" ]]; then
    echo "Skipping $name: directory '$prefix' not found."
    return
  fi

  local branch="split-${name}-$(date +%s)"
  echo "Creating split branch $branch from prefix '$prefix'..."
  git subtree split --prefix="$prefix" -b "$branch" >/dev/null

  local dest="${DIST_DIR}/prehire-${name}"
  rm -rf "$dest"
  echo "Cloning branch $branch into $dest..."
  git clone . "$dest" --branch "$branch" --single-branch >/dev/null

  if [[ -n "$remote" ]]; then
    echo "Configuring remote for $name -> $remote"
    (
      cd "$dest"
      git remote remove origin >/dev/null 2>&1 || true
      git remote add origin "$remote"
      git push -u origin "$branch:main"
    )
  else
    echo "No remote provided for $name; repository exported locally at $dest."
  fi

  git branch -D "$branch" >/dev/null
  echo "Finished $name."
}

split_and_push "frontend" "$FRONTEND_PREFIX" "$FRONTEND_REMOTE"
split_and_push "backend" "$BACKEND_PREFIX" "$BACKEND_REMOTE"
split_and_push "devops" "$DEVOPS_PREFIX" "$DEVOPS_REMOTE"
split_and_push "shared" "$SHARED_PREFIX" "$SHARED_REMOTE"

echo "All requested splits complete. See $DIST_DIR/ for exported repositories."
