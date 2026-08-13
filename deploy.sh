#!/bin/bash
#
# deployment-type: stable | hotfix
# version-type: major | minor | patch
#
# Usage:
#   ./deploy.sh stable:minor
#   ./deploy.sh --preflight stable:minor
#   ./deploy.sh --dry-run stable:minor
#   ./deploy.sh --confirm stable:minor
#   ./deploy.sh --develop-branch=custom-dev stable:minor
#   ./deploy.sh --continue

set -euo pipefail

TERM=xterm-256color
MODE="normal"
DEPLOYMENT_TARGET=""
SKIP_CONFIRM=false
DEVELOP_BRANCH="develop"
CONTINUE_DEPLOY=false
STATE_FILE=".deploy_state"

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --preflight|--dry-run) MODE="${arg/--/}" ;;
    --confirm) SKIP_CONFIRM=true ;;
    --develop-branch=*) DEVELOP_BRANCH="${arg#*=}" ;;
    --continue) CONTINUE_DEPLOY=true ;;
    *) DEPLOYMENT_TARGET="$arg" ;;
  esac
done

if [[ "${DEPLOYMENT_TARGET:-}" == "" && "$CONTINUE_DEPLOY" = false ]]; then
  echo "❌ No deployment target specified."
  echo
  echo "Usage:"
  echo "  ./deploy.sh stable:minor"
  echo "  ./deploy.sh --preflight stable:minor"
  echo "  ./deploy.sh --dry-run stable:minor"
  echo "  ./deploy.sh --confirm stable:minor"
  echo "  ./deploy.sh --develop-branch=custom stable:minor"
  echo "  ./deploy.sh --continue"
  exit 1
fi

DEPLOYMENT_TYPE=$(echo "$DEPLOYMENT_TARGET" | cut -d ':' -f 1)
VERSION_TYPE=$(echo "$DEPLOYMENT_TARGET" | cut -d ':' -f 2)
CURRENT_VERSION="v$(jq -r '.version' package.json)"
LATEST_VERSION=""
COMMIT_MESSAGE=""

# Determine default branch safely
DEFAULT_BRANCH=$(git symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || true)
if [ -z "$DEFAULT_BRANCH" ]; then
  if git show-ref --verify --quiet refs/heads/main; then
    DEFAULT_BRANCH="main"
  elif git show-ref --verify --quiet refs/heads/master; then
    DEFAULT_BRANCH="master"
  else
    echo "❌ Could not determine default branch. Set refs/remotes/origin/HEAD or use --develop-branch flag."
    exit 1
  fi
fi

TARGET_BRANCH="$DEFAULT_BRANCH"
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CHANGES_STASHED=false

# Helper: Save state
save_state() {
  echo "STEP=$1" > "$STATE_FILE"
  echo "LATEST_VERSION=\"$LATEST_VERSION\"" >> "$STATE_FILE"
  echo "COMMIT_MESSAGE=\"$COMMIT_MESSAGE\"" >> "$STATE_FILE"
  echo "CHANGES_STASHED=$CHANGES_STASHED" >> "$STATE_FILE"
  echo "ORIGINAL_BRANCH=\"$ORIGINAL_BRANCH\"" >> "$STATE_FILE"
}

# Helper: Load state
load_state() {
  if [ -f "$STATE_FILE" ]; then
    set -a
    source "$STATE_FILE"
    set +a
  else
    echo "❌ No previous state found. Cannot continue."
    exit 1
  fi
}

# Helper: Remove state file
remove_state() {
  [ -f "$STATE_FILE" ] && rm "$STATE_FILE"
}

# --------------- Functions ----------------

run_preflight_checks() {
  echo "✅ Running preflight checks..."
  if ! [[ "$DEPLOYMENT_TYPE" =~ ^(stable|hotfix)$ ]]; then
    echo "❌ Unknown deployment type: ${DEPLOYMENT_TYPE}" && exit 1
  fi

  if ! [[ "$VERSION_TYPE" =~ ^(major|minor|patch)$ ]]; then
    echo "❌ Unknown version type: ${VERSION_TYPE}" && exit 1
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq is required but not installed. Aborting." && exit 1
  fi

  if ! gh auth status >/dev/null 2>&1; then
    echo "🔐 GitHub CLI found but not authenticated. Starting login..."
    gh auth login
  fi

  echo "✅ Preflight checks passed."
}

run_dry_run() {
  local current=$(jq -r '.version' package.json)
  IFS='.' read -r major minor patch <<< "$current"

  case "$VERSION_TYPE" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
    *) echo "❌ Invalid version type: $VERSION_TYPE" && exit 1 ;;
  esac

  local simulated_version="${major}.${minor}.${patch}"

  echo "🔍 DRY RUN — simulating deployment"
  echo "DEPLOYMENT_TYPE: $DEPLOYMENT_TYPE"
  echo "VERSION_TYPE: $VERSION_TYPE"
  echo "Current version: v$current"
  echo "Simulated new version: v$simulated_version"
  echo "Would create branch: release/v$simulated_version"
  echo "Would generate CHANGELOG.md (if tool exists)"
  echo "Would commit: release: bump version from v$current to v$simulated_version"
  echo "Would push to origin: release/v$simulated_version"
  echo "Would squash merge into $DEFAULT_BRANCH, tag and rebase $DEVELOP_BRANCH"
  echo "✅ DRY RUN complete"
}

# ----------- HEALTH CHECK FUNCTION -----------

check_package_health() {
  echo "🔍 Checking package health before publish..."

  # 1. Ensure in a Node.js project
  if [ ! -f package.json ]; then
    echo "❌ package.json not found. Are you in the root of a Node.js project?"
    exit 1
  fi

  # 2. Clean install dependencies
  if [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
    echo "📦 Installing dependencies using yarn..."
    yarn install --frozen-lockfile
  else
    echo "📦 Installing dependencies using npm..."
    npm ci
  fi

  # 3. Check for vulnerabilities
  if command -v npm >/dev/null 2>&1; then
    echo "🔒 Running npm audit..."
    npm audit --audit-level=high || echo "⚠️  Vulnerabilities found. Review above."
  fi

  # 4. Run lint if available
  if npm run | grep -qw lint; then
    echo "🧹 Running lint..."
    npm run lint
  fi

  # 5. Run build if available
  if npm run | grep -qw build; then
    echo "🏗️ Building package..."
    npm run build
  fi

  # 6. Run tests if available
  if npm run | grep -qw test; then
    echo "🧪 Running tests..."
    npm test
  fi

  # 7. Do a dry-run publish
  echo "🚦 Performing npm publish dry-run..."
  npm publish --dry-run

  echo "✅ Package health check completed. Ready for npm publish!"
}

prepare_release_version() {
  # Version bump
  LATEST_VERSION=$(npm version "$1" --no-git-tag-version | tr -d 'v')
  COMMIT_MESSAGE="release: bump version from $CURRENT_VERSION to v$LATEST_VERSION"

  # Changelog generation (warn if not installed)
  if [ -x ./node_modules/.bin/conventional-changelog ] || command -v conventional-changelog >/dev/null 2>&1; then
    echo "📝 Generating CHANGELOG.md..."
    if [ -f CHANGELOG.md ]; then
      npx conventional-changelog -p angular -i CHANGELOG.md -s
    else
      npx conventional-changelog -p angular -o CHANGELOG.md
    fi
  else
    echo "⚠️ Skipping changelog update (conventional-changelog not found)"
  fi

  # Clean install dependencies (already checked in health check, but kept for safety)
  if [ -f yarn.lock ] && command -v yarn >/dev/null 2>&1; then
    echo "📦 Installing dependencies using yarn..."
    yarn install --frozen-lockfile
  else
    echo "📦 Installing dependencies using npm..."
    npm ci
  fi

  git add .
  git checkout -b "release/v$LATEST_VERSION"
  git commit -m "$COMMIT_MESSAGE"
  git push origin "release/v$LATEST_VERSION" || {
    echo "❌ Failed to push release branch. Resolve the issue (e.g., by rebasing), then run './deploy.sh --continue'."
    save_state "prepare_release_version"
    exit 1
  }
}

publish_release_version() {
  # Check npm package health before actual publish
  print_separator
  print_process "checking:package-health"
  check_package_health
  print_status_done

  # Compose commit messages for release note
  MERGE_COMMIT_MESSAGES=$(git log "$TARGET_BRANCH".."release/v$LATEST_VERSION" \
    --format='- [%h][%an]: %s - %ad' \
    --date=format:'%Y-%m-%d %H:%M:%S' \
    --no-merges | grep -v ": release/v")

  MERGE_COMMIT_HEADER_AND_MESSAGES=$(echo -e "release/v$LATEST_VERSION\n${MERGE_COMMIT_MESSAGES}")

  git checkout "$TARGET_BRANCH" && git pull --rebase origin "$TARGET_BRANCH"
  git merge --squash "release/v$LATEST_VERSION"
  git commit -m "$MERGE_COMMIT_HEADER_AND_MESSAGES"
  git push origin "$TARGET_BRANCH" || {
    echo "❌ Failed to push $TARGET_BRANCH. Resolve the issue, then run './deploy.sh --continue'."
    save_state "publish_release_version"
    exit 1
  }
  git tag -a "v$LATEST_VERSION" -m "$MERGE_COMMIT_HEADER_AND_MESSAGES"
  git push origin "v$LATEST_VERSION"

  # ➕ GitHub Release Automation
  if command -v gh >/dev/null 2>&1; then
    echo "🚀 Creating GitHub release for v$LATEST_VERSION..."
    gh release create "v$LATEST_VERSION" \
      --title "v$LATEST_VERSION" \
      --notes "$MERGE_COMMIT_HEADER_AND_MESSAGES"
    echo "✅ GitHub release created successfully"
  else
    echo "⚠️ GitHub CLI (gh) not found, skipping GitHub release creation"
  fi

  git checkout "$DEVELOP_BRANCH"
  git pull --rebase origin "$DEVELOP_BRANCH"
  git merge --ff-only "release/v$LATEST_VERSION" || {
    echo "❌ Could not fast-forward $DEVELOP_BRANCH to release/v$LATEST_VERSION. Resolve the branch state, then run './deploy.sh --continue'."
    save_state "publish_release_version"
    exit 1
  }
  git push origin "$DEVELOP_BRANCH" || {
    echo "❌ Failed to push $DEVELOP_BRANCH. Resolve the issue, then run './deploy.sh --continue'."
    save_state "publish_release_version"
    exit 1
  }

  print_separator
  print_process "npm-publish:public"
  echo "🚀 Publishing v$LATEST_VERSION to the npm registry..."
  npm publish --access public
  print_status_done
}

cleanup_release_version() {
  git checkout "$DEVELOP_BRANCH"
  git push origin "$DEVELOP_BRANCH"
  if git branch | grep -q "release/v$LATEST_VERSION"; then
    git branch -D "release/v$LATEST_VERSION"
  fi
  if git ls-remote --exit-code --heads origin "release/v$LATEST_VERSION" >/dev/null 2>&1; then
    git push origin --delete "release/v$LATEST_VERSION"
  fi
  git fetch origin --prune --verbose
}

sync_repository() {
  git fetch origin --prune --verbose

  # Ensure TARGET_BRANCH exists on remote
  if git ls-remote --exit-code --heads origin "$TARGET_BRANCH" >/dev/null 2>&1; then
    git checkout "$TARGET_BRANCH" && git pull --rebase origin "$TARGET_BRANCH"
  else
    echo "⚠️ Remote branch $TARGET_BRANCH not found. Creating it from local $TARGET_BRANCH."
    git checkout -b "$TARGET_BRANCH" || git checkout "$TARGET_BRANCH"
    git push -u origin "$TARGET_BRANCH"
  fi

  # Ensure DEVELOP_BRANCH exists on remote
  if git ls-remote --exit-code --heads origin "$DEVELOP_BRANCH" >/dev/null 2>&1; then
    git checkout "$DEVELOP_BRANCH"
    git pull --rebase origin "$DEVELOP_BRANCH"
  else
    echo "⚠️ Remote branch $DEVELOP_BRANCH not found. Creating it from local $DEVELOP_BRANCH."
    git checkout -b "$DEVELOP_BRANCH" || git checkout "$DEVELOP_BRANCH"
    git push -u origin "$DEVELOP_BRANCH"
  fi

  # Ensure LATEST_VERSION does not exist on remote
  if git ls-remote --exit-code --heads origin "release/v$LATEST_VERSION" >/dev/null 2>&1; then
    echo "⚠️ Release branch already exists on origin. Aborting to avoid overwrite."
    exit 1
  fi
}

validate_input() {
  echo "DEPLOYMENT_TYPE: $DEPLOYMENT_TYPE"
  echo "VERSION_TYPE: $VERSION_TYPE"

  if [ "$SKIP_CONFIRM" = true ]; then
    echo "✅ Input auto-confirmed"
    return
  fi

  read -p "Are you sure? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Confirmed"
  else
    echo "Cancelled"
    exit 1
  fi
}

usage() {
  echo "# Usage:"
  echo "#   ./deploy.sh stable:minor"
  echo "#   ./deploy.sh --preflight stable:minor"
  echo "#   ./deploy.sh --dry-run stable:minor"
  echo "#   ./deploy.sh --confirm stable:minor"
  echo "#   ./deploy.sh --develop-branch=custom stable:minor"
  echo "#   ./deploy.sh --continue"
  echo "#"
  echo "# deployment-type: stable | hotfix"
  echo "# version-type: major | minor | patch"
  exit 0
}

print_separator() {
  echo -e "\033[36m.........................................\033[0m"
}

print_process() {
  echo -e "\033[36mProcess: \033[32m$1\033[0m"
}

print_status_done() {
  echo -e "\033[36mStatus: \033[32mdone\033[0m"
}

print_status_failed() {
  echo -e "\033[36mStatus: \033[31mfailed\033[0m" && exit 1
}

print_release_version() {
  echo -e "New \033[36m$DEPLOYMENT_TYPE\033[0m version \033[32mv$LATEST_VERSION\033[0m has been released."
  echo -e "\n✅ v$LATEST_VERSION was published directly to npm."
}

# --------------- Entry Point ----------------

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
fi

if [ "$CONTINUE_DEPLOY" = true ]; then
  # Continue from last failure
  load_state
  print_separator
  echo "Continuing deployment from last failed step: $STEP"
  case "$STEP" in
    prepare_release_version)
      print_process "preparing:release-version"
      prepare_release_version "$VERSION_TYPE"
      print_status_done
      print_separator
      print_process "publishing:release-version"
      publish_release_version
      print_status_done
      print_separator
      print_process "cleaning:release-version"
      cleanup_release_version
      print_status_done
      ;;
    publish_release_version)
      print_process "publishing:release-version"
      publish_release_version
      print_status_done
      print_separator
      print_process "cleaning:release-version"
      cleanup_release_version
      print_status_done
      ;;
    *)
      echo "❌ Unknown or invalid step in $STATE_FILE."
      exit 1
      ;;
  esac
  print_separator
  print_release_version
  print_separator
  remove_state
  # Restore original branch
  if [[ "$ORIGINAL_BRANCH" != "$DEFAULT_BRANCH" && "$ORIGINAL_BRANCH" != "$DEVELOP_BRANCH" ]]; then
    git checkout "$ORIGINAL_BRANCH"
  fi
  if [ "$CHANGES_STASHED" = true ]; then
    echo "📦 Restoring stashed changes..."
    git stash list | grep "pre-deploy changes" >/dev/null && git stash pop
  fi
  exit 0
fi

if [[ "$MODE" == "normal" || "$MODE" == "preflight" ]]; then
  print_separator
  print_process "checking:preflight"
  run_preflight_checks
  print_status_done
fi

if [ "$MODE" == "preflight" ]; then exit 0; fi

if [[ "$MODE" == "normal" || "$MODE" == "dry-run" ]]; then
  print_separator
  print_process "dry-run:preview"
  run_dry_run
  print_status_done
fi

if [ "$MODE" == "dry-run" ]; then exit 0; fi

print_separator
print_process "validating:input"
validate_input
print_status_done

# Detect local uncommitted changes; prompt to stash or abort for safety
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❗ Uncommitted changes detected."
  read -p "Do you want to stash them before proceeding? (Y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Aborting for safety. Please commit, stash, or clean your working directory."
    exit 1
  else
    echo "💾 Stashing local changes..."
    git stash push -u -m "pre-deploy changes"
    CHANGES_STASHED=true
  fi
fi

print_separator
print_process "syncing:repository"
sync_repository
print_status_done

print_separator
print_process "preparing:release-version"
prepare_release_version "$VERSION_TYPE"
print_status_done

print_separator
print_process "publishing:release-version"
publish_release_version
print_status_done

print_separator
print_process "cleaning:release-version"
cleanup_release_version
print_status_done

print_separator
print_release_version
print_separator

# Restore original branch
if [[ "$ORIGINAL_BRANCH" != "$DEFAULT_BRANCH" && "$ORIGINAL_BRANCH" != "$DEVELOP_BRANCH" ]]; then
  git checkout "$ORIGINAL_BRANCH"
fi

if [ "$CHANGES_STASHED" = true ]; then
  echo "📦 Restoring stashed changes..."
  git stash list | grep "pre-deploy changes" >/dev/null && git stash pop
fi

remove_state
