# Maintaining releases

Versions are chosen explicitly. Release tags (`vX.Y.Z`, optionally SemVer prereleases such as `v0.3.0-rc.1`) are immutable. Build metadata is intentionally unsupported so each version has one tag identity. `latest` is a branch at the exact commit of the highest stable **published** GitHub Release; it is never the development branch. Prereleases and drafts are excluded. Versions are compared numerically, so `0.10.0` sorts after `0.9.0`.

Use Node 22.20 or newer, Git, and authenticated GitHub CLI (`gh`) for maintainer commands. Install development checks with `npm ci` and `npx playwright install chromium` (Linux CI also needs `--with-deps`). Installation of the skills themselves does not need this development toolchain.

Use a single `origin` URL on `github.com`: HTTPS, `git@github.com:owner/repo.git`, or `ssh://git@github.com/owner/repo.git`. Do not configure a separate `remote.origin.pushurl` for release commands. The CLI derives the publication repository from this origin and explicitly targets it for every GitHub operation, regardless of `GH_REPO` or the GitHub CLI default repository. This keeps tag validation, publication, and `latest` reconciliation tied to the same repository. Unsupported origin forms fail before publication.

Prepare the first release:

```sh
node scripts/version.mjs set 0.2.0
node scripts/version.mjs validate v0.2.0
npm test
git diff
```

The setter updates all three plugin manifest versions and preserves their other fields. Validation checks synchronized versions, plugin identity, and discovery paths. No command infers a version from commit messages. Review all intended changes, commit them, and only then create and push the tag:

```sh
git add <reviewed-files>
git commit -m "Prepare v0.2.0"
git tag -a v0.2.0 -m "v0.2.0"
git push origin HEAD
git push origin v0.2.0
```

These are maintainer actions; implementation of the spec does not authorize running them. Never recreate, force-push, or move an existing version tag. Correct a bad published release with a new version.

The release workflow checks out the tag and runs `node scripts/release.mjs v0.2.0`. This command checks the remote tag's commit against the local immutable tag, validates **committed** manifests, and runs all committed `tests/*.test.mjs` in a detached temporary worktree before publication. When a lockfile exists, it installs that commit's development dependencies with `npm ci --ignore-scripts`. Failed checks prevent publication. The working directory's uncommitted files cannot substitute for release contents. It creates a GitHub Release using the already-pushed tag (`--verify-tag`); it never creates or rewrites remote version tags.

After successful publication, the command queries every page of GitHub Releases and reconciles `latest`. Updates use an explicit Git compare-and-swap lease. A losing concurrent writer rereads both release records and the branch before retrying, so an older job cannot overwrite a newer published version. Workflow serialization additionally reduces contention; correctness does not depend on job ordering. A retry recognizes an existing published release and does not duplicate it. The repository's `latest` branch is independent of GitHub's UI “Latest” badge.

Repository prerequisites: GitHub Actions must allow `contents: write`; repository rules must permit the workflow token to create Releases and update `latest`, including non-fast-forward updates. Keep immutable `v*` tags protected from modification or deletion. Restrict who can dispatch workflows and push release tags. Configure remote permissions/rules explicitly as a maintainer; the tooling does not alter them.

## Failure recovery

Release publication and the branch update cannot be atomic. A failed/uncertain publication leaves `latest` untouched and reports failure. A successful publication followed by a rejected branch push reports a partial failure; users may still install the immutable tag. Inspect the GitHub Release, workflow output, and repository rules or credentials. Fix the external cause, then rerun the failed workflow or dispatch **Release** with the same existing tag. Locally, from the reviewed release checkout with its dependencies/browser available:

```sh
node scripts/release.mjs v0.2.0
```

The retry revalidates and reruns checks, confirms existing publication, and reconciles the highest published stable version. If a draft Release already exists, resolve its state explicitly in GitHub before retrying; the command will not silently publish a draft. A network failure while listing Releases fails the job and can be retried the same way. Never repair partial failure by moving the version tag or manually pointing `latest` to development work.

Do not delete published stable releases or their tags: the highest published release is the source of truth for recovery. Failed branch updates leave the previous stable installation usable. Before the first publication, both public installation refs may be missing; missing refs must fail, with no development-branch fallback.

After publication, smoke-test both README installation URLs in disposable projects and confirm the installed skill files/assets and recorded ref match the intended tag and `latest` commit. Local tests use temporary Git remotes and a controlled GitHub publication boundary; they do not prove live GitHub permissions, release publication, or branch rules.
