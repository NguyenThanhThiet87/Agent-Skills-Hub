---
name: git-release-flow
description: >-
  Automate semantic versioning, changelog generation from conventional commits,
  and GitHub release tag publishing.
category: Coding
trigger: on_demand
parameters:
  bump_type:
    type: string
    description: Semver bump type (patch, minor, major)
    default: patch
  dry_run:
    type: boolean
    description: Validate changes without pushing remote tags
    default: true
---

# Git Release Flow Runbook

Automate semantic releases with conventional commits for team repositories.

## Workflow Execution Steps
1. Verify workspace is clean: `git status --porcelain`
2. Generate changelog: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
3. Bump version in package manifest and commit: `git commit -am "chore(release): vX.Y.Z"`
4. Tag release: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
5. Push commit and tags: `git push --follow-tags origin main`
