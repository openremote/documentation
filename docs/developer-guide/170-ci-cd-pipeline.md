# CI/CD pipeline

This document describes the continuous integration and continuous deployment (CI/CD) pipeline of the [core repository](https://github.com/openremote/core), introducing the concepts and workflows added in our pipeline migration ([#2696](https://github.com/openremote/core/pull/2696)). The pipeline runs on GitHub Actions and its workflows are in the [`.github/workflows`](https://github.com/openremote/core/tree/main/.github/workflows) directory.

## Overview of the workflows

The pipeline is structured using a separation of concerns between environments and jobs:

- **Environment Workflows**: These are context specific workflows that act as the orchestrator for different triggers:
  - `review.yml` for Pull Requests and the merge queue.
  - `staging.yml` for pushes to `main` and release tags. It builds, tests and publishes the Docker images, Maven artifacts and npm packages.
  - `deploy.yml` for manual [deployments](#deployments).
  - `custom-review.yml`, `custom-staging.yml` and `custom-deploy.yml`, which [custom projects](#custom-projects) call from their own workflows.
- **Job Workflows**: These are reusable workflows (`workflow_call`) that contain the actual steps for specific tasks (like running tests, building dists, or publishing artifacts). Environment workflows call these job workflows, which prevents duplication.

The previous pipeline, `ci_cd.yml`, is kept for custom projects that have not migrated to the new workflows yet.

### How reusable workflows work

Job workflows are configured as reusable workflows. This allows them to be shared across multiple environments.

A job that calls a reusable workflow reports a status check for each job in that workflow, named `<calling job> / <job>`. For example, the `unit-tests` job in `review.yml` is named `Test` and calls `unit-tests.yml`, whose job is named `Unit Tests`, so the check is `Test / Unit Tests`. Branch protection on `main` requires these checks by name.

### Composite actions

Composite actions are defined under `.github/actions/` and act as reusable steps (unlike reusable workflows, which act as reusable jobs). We use them to keep things DRY.

## How the pipeline works

### Detect changes

We use a "detect changes" job early in the workflow to determine which files have been modified. Subsequent jobs use the outputs of this job as their `skip` condition:

- `backend_any_modified`: Unit and integration tests only run when backend code changed.
- `ui_any_modified`: UI component tests only run when UI code changed.
- `any_modified`: The build, the manager image and the UI app tests run for any backend or UI change, because the UI app tests run against the whole stack.
- `backend_spotless_any_modified` and `ui_spotless_any_modified`: The Spotless checks only run when files checked by Spotless changed.

For example:

- A PR that only touches backend Java code skips the UI component tests, but still runs the UI app tests.
- A PR that only touches UI code skips the backend unit and integration tests, so only the build and the UI related jobs run.
- A PR that only changes Markdown files skips the build and all tests, but still runs the Spotless checks.

### Handling skipped jobs

If the calling job is skipped, GitHub only reports a check for the calling job (e.g. `Test`), so required checks like `Test / Unit Tests` are never reported and the PR waits for them indefinitely. A required check that is reported as skipped does satisfy branch protection, so you need to handle skipping _inside_ the reusable workflow itself rather than skipping the entire `workflow_call`.

Each job workflow that can be skipped therefore has a `skip` input that its job checks, and the environment workflow passes the skip condition:

```yaml
# review.yml
unit-tests:
  name: Test
  needs: detect-changes
  if: ${{ !failure() && !cancelled() }}
  uses: "./.github/workflows/unit-tests.yml"
  with:
    skip: ${{ needs.detect-changes.outputs.backend_any_modified != 'true' }}
```

```yaml
# unit-tests.yml
on:
  workflow_call:
    inputs:
      skip:
        type: boolean
        description: Skip condition to allow branch protection checks to pass
        default: false

jobs:
  unit-tests:
    name: Unit Tests
    if: ${{ !inputs.skip }}
```

The `!failure() && !cancelled()` condition on the calling job is explained in [Special conditions](#special-conditions).

### Special conditions

You will often see special conditionals used in the pipeline:

- `if: ${{ !failure() && !cancelled() }}`: Used on most jobs in the environment workflows. By default, a job is skipped when a job it needs was skipped. This condition lets it run anyway, unless a job it needs failed or the workflow run was cancelled.
- `if: always()`: Ensures a step or job runs regardless of whether previous steps or jobs failed. This is typically used to ensure test results and coverage reports are uploaded even when tests fail, and for the `UI App Tests Status` job.
- `if: failure()`: Runs a step only when a previous step in the job failed, or a job only when a job it needs failed. Use it to clean up environments or post error notifications.

### Sharding UI app tests

To speed up the UI app tests, `ui-app-tests.yml` splits them into shards using a matrix job (`shardIndex` and `shardCount`). Each shard runs a part of the tests in parallel using the Playwright `--shard` option and uploads its own test report. `fail-fast: false` lets the other shards finish when one fails, so you see all failing tests at once.

A matrix job reports a check for each shard, but when the job is skipped it reports a single check without the matrix values. The checks of the individual shards therefore can't be required by branch protection. Instead, the `UI App Tests Status` job runs after the shards with `if: always()` and combines their results: it fails when a shard failed or was cancelled, and succeeds when the shards succeeded or were skipped. Branch protection requires this check instead of the shard checks.

### Deployments

Deployments are done by the reusable `deployment.yml` workflow. It builds the deployment, determines which environments to deploy to and runs the `.ci_cd/deploy.sh` script for each of them. By default, it checks the type of event that triggered the workflow (for example a `push` to a specific branch) and deploys to the environments configured for that event in the `deploy` configuration in `.ci_cd/ci_cd.json`. When you dispatch a deployment manually on a branch, you choose the environment with the `ENVIRONMENT` input instead. When you dispatch it on a tag, the `workflow_dispatch` deploy entry in `.ci_cd/ci_cd.json` is used instead of the `ENVIRONMENT` and `MANAGER_TAG` inputs.

In the core repository, `staging.yml` does not deploy. Deployments, for example to test servers, are triggered manually with the `deploy.yml` dispatch workflow. To reduce the deployment time significantly, it only runs the jobs a deployment requires (`install-dist` and `deployment`) and skips the tests.

Custom projects deploy with `custom-staging.yml` and `custom-deploy.yml`, see [Custom projects](#custom-projects).

## Custom projects

[Custom projects](./040-creating-a-custom-project.md) reuse the pipeline by calling the following workflows of the core repository from their own workflows:

| Workflow             | Trigger in the custom project | Stages                                                                                                                                     |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `custom-review.yml`  | Pull Requests                 | Lint, build, and test.                                                                                                                     |
| `custom-staging.yml` | Pushes                        | The same as `custom-review.yml`, followed by a deployment when no job failed and `.ci_cd/ci_cd.json` configures one for the pushed branch. |
| `custom-deploy.yml`  | Manual (`workflow_dispatch`)  | A deployment using `deployment.yml`.                                                                                                       |

Reference the core workflows by release version rather than a branch like `main`, so changes to the core pipeline don't unexpectedly break custom projects. When no release includes the workflow changes you need, reference a commit SHA instead, with a comment naming the closest release (`git describe --tags --abbrev=0 <commit-sha>`). For example, releases up to 1.32.2 don't include these workflows, so you reference the merge commit of [#3441](https://github.com/openremote/core/pull/3441) or later:

```yaml
uses: openremote/core/.github/workflows/custom-review.yml@b5e84f1b83b64c7808b59823dfd0a9cd3cee1c8f # 1.32.2
```

The exception is `custom-project-test`, which references `main` on purpose to catch issues with changes to the core pipeline early.

The core workflows use `${{ github.workflow }}-${{ github.ref }}` as their concurrency group, and in a called workflow `github.workflow` is the name of the calling workflow. Don't use the same concurrency group in the calling workflow, because GitHub cancels the run as a deadlock.

### Differences from the core workflows

The custom project workflows differ from the core workflows in the following ways:

- **Build:** They build with `custom-install-dist.yml`, which only runs `./gradlew installDist`. The archive steps in `install-dist.yml` assume the layout of the core repository (e.g. `ui/util`), and no custom project job downloads those artifacts. The build includes the deployment, and changes to the `deployment` directory count as code changes, so a broken deployment build already fails in review.
- **Code coverage:** Not run yet, because `code-coverage.yml` requires JaCoCo outputs and the `combinedCoverageReport` Gradle task.
- **Manager version:** Deployments use the manager Docker image matching the `openremote` version in `gradle/libs.versions.toml`. Snapshot versions are not supported.
- **Deploy script:** `deployment.yml` runs the `.ci_cd/deploy.sh` script of the core repository at the same `openremote` version. Up to 1.32.0, this script reads the `IS_MAIN_REPO` environment variable and the `openremote/.ci_cd` directory, so `deployment.yml` provides both.

### Manual deployments

Custom projects call `custom-deploy.yml` instead of `deploy.yml` or `deployment.yml`, so they don't depend on the inputs of `deployment.yml`. It must be called from a `workflow_dispatch` workflow:

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      ENVIRONMENT:
        description: "Environment to use (if any)"
      CLEAN_INSTALL:
        description: "Delete data before starting"
        type: boolean
      COMMIT:
        description: "Repo branch or commit SHA to checkout"
      OR_HOSTNAME:
        description: "Host to deploy to (e.g. demo.openremote.app)"
      OR_ADMIN_PASSWORD:
        description: "Admin password override"

jobs:
  deploy:
    name: Deploy
    uses: openremote/core/.github/workflows/custom-deploy.yml@<version>
    with:
      INPUTS: ${{ toJSON(inputs) }}
    secrets: inherit
```

The calling workflow must be on the default branch before you can trigger it from the GitHub UI.

### Migrating from `ci_cd.yml`

The new workflows report different status checks than `ci_cd.yml`. When you migrate a custom project, remove the `CI/CD / CI/CD` check from the required checks in its branch protection and add the checks of `custom-review.yml` instead. Their names start with the name of the job that calls `custom-review.yml` (see [How reusable workflows work](#how-reusable-workflows-work)):

- `<calling job> / Detect whether code changed`
- `<calling job> / Lint / Backend Check Spotless`
- `<calling job> / Lint / UI Check Spotless`
- `<calling job> / Build / Install Dist`
- `<calling job> / Test / Unit Tests`
- `<calling job> / Test / Integration Tests`

## Making changes to the pipeline

### Testing changes

When modifying the pipeline, you should generally branch off `main` and test your changes by opening a Pull Request. Since the workflows run automatically for PRs, you can iterate on pipeline changes within the PR itself.

Changes to `.yml` files do not count as code changes when [detecting changes](#detect-changes), so a PR that only changes workflows skips the build and test jobs. To run the jobs you changed, temporarily include a change to a source file in your PR.

To test changes without polluting the main repository, you can:

1. Push to your own fork and test against custom branches.
2. Test dispatchable workflows manually. Note that if a workflow file has not been merged to `main` yet, you cannot trigger it from the GitHub Actions UI. Instead, you must use the [GitHub CLI](https://cli.github.com/) to trigger it on your feature branch:

   ```bash
   gh workflow run <workflow-name.yml> --ref <your-feature-branch>
   ```

   :::note

   If you are adding a completely new dispatchable workflow file, it won't be recognized by GitHub at all until it is registered. A common workaround is to temporarily add an `on: [push]` event to the workflow, push your branch so it runs once, and then remove the `push` event. After this, it will be available to trigger via the CLI.

   :::

### Writing and updating composite actions

To write or update a composite action:

1. Create an `action.yml` file in a dedicated folder under `.github/actions/`.
2. Define `runs: using: "composite"`.
3. Reference the action in a workflow using `uses: openremote/core/.github/actions/your-action-name@<commit-sha>`.

Don't reference actions with a local path like `./.github/actions/your-action-name` in workflows that custom projects also use. A local path is resolved in the checked-out repository, which is the custom project in that case.

:::warning

After changing a composite action, update the commit SHA in the workflows that use it to the SHA of **the commit that changed the action** on your PR branch. Because PRs are squash merged, this SHA differs from the SHA of the commit that ends up in the history of the `main` branch, so it points to a dangling commit. This could become an issue if the repository is ever garbage collected, also for the custom projects that call these workflows. We accept this risk, because it is less cumbersome than waiting for the PR to be merged and then creating a follow-up PR to update the commit SHAs, or changing the merge rules to allow merging individual commits.

If you reference a commit on `main` instead, Dependabot considers the reference to follow the `main` branch. Every time a new commit is merged, it opens a PR to update the SHA to the latest commit on `main`, even though the action didn't change (see [#3067](https://github.com/openremote/core/pull/3067), [#3081](https://github.com/openremote/core/pull/3081) and [#3087](https://github.com/openremote/core/pull/3087)). [#3093](https://github.com/openremote/core/pull/3093) stopped these PRs by pointing the references to a commit that is not part of the `main` history.

:::

Dependabot also updates the actions used inside our composite actions. When it does, add a commit to the Dependabot PR as described above (see [#3301](https://github.com/openremote/core/pull/3301)).

## Guidelines

### Gradle vs. workflows

A good rule of thumb is:

- **Use Gradle** to manage the internal build lifecycle, task graphs, dependencies, and code compilation.
- **Use Workflows** for orchestration, conditional job execution (e.g., detect changes), environment provisioning, and deployment.

If a task can be optimized or defined within Gradle (such as skipping a task with `-x`), prefer that over complex bash scripts in the workflow. For example, `install-dist.yml` runs `./gradlew installDist -x :deployment:installDist`, because the core repository builds the deployment in `deployment.yml`. However, if skipping a process depends on the GitHub PR context (like changes to specific directories), manage it at the workflow level.

### Minimal dependency installation

Installing fewer dependencies is an optimization in itself, because every dependency a job installs adds download and setup time. Jobs should therefore only install what they need. For example, `install-browsers.yml` only installs the `chromium-headless-shell` Playwright browser (at the Playwright version from `ui/test/package.json`) instead of all Playwright browsers.

Install shared dependencies once, early in the pipeline. `install-browsers.yml` downloads the Playwright browser once and runs in parallel with the build, before the UI component tests and the UI app test shards start. These jobs then get the browser from an artifact instead of each downloading it themselves. The download time of the Playwright browser differed a lot per shard, so downloading only once also made the pipeline more stable. Likewise, jobs download the build outputs of `install-dist` instead of building them again.

### Checking out with Git LFS

Only use `lfs: true` in the `actions/checkout` step if the job actually requires files stored in Git LFS (like the `*.mbtiles` map tiles). Checking out LFS files adds significant time and bandwidth overhead, so it is omitted where possible.

### Artifacts

Artifacts are used to share files between isolated jobs.

**The most important rule for artifacts is to split them where possible and create artifacts containing only the bare necessities for each specific job.**

- **What to include:** Only the files downstream jobs need, such as build outputs, test reports and coverage files. Select specific build outputs, like `install-dist.yml` does for the UI component build, rather than uploading full `build` folders. Only upload a full folder when downstream jobs need all of it: the `or-manager-build` artifact contains `manager/build`, because the manager image build, the UI app tests and deployments use the manager distribution in it. Never upload `node_modules`.
- **When to use them:** Only pass artifacts when a downstream job strictly requires the output of an upstream job. Artifact upload/download takes time and consumes storage. Anyone with read access to the repository can download its artifacts, so never include secrets or other sensitive data.
- **Optimization through splitting:** Uploading separate, minimal artifacts (e.g., `install-dist.yml` saves the manager build, UI component build and UI app build as separate artifacts rather than one massive archive) ensures downstream jobs only download exactly what they need, significantly speeding up the pipeline.

### File modified metadata tricks

To avoid rebuilding components when passing artifacts between jobs, we update file modified metadata after downloading artifacts. For example, jobs that use the downloaded UI component build run `find . -name "*.tsbuildinfo" -exec touch {} +`. This makes the TypeScript compiler recognize that the downloaded build output is up-to-date, preventing unnecessary compilations. Run `npx tsc -b --verbose` to see why TypeScript considers a build out of date.

### Caching

We implement several caching strategies to speed up builds:

- **Gradle:** `actions/setup-java` with `cache: "gradle"` restores the Gradle dependencies and wrapper at the beginning of jobs, to skip downloading them again.
- **Docker Images:** Docker layer caching is used to avoid rebuilding unmodified layers. We utilize the GitHub Actions cache backend for Docker buildx (`type=gha`).

### Timeouts

Always add `timeout-minutes: 20` (or an appropriate limit) to any step or job that could potentially hang (such as tests or network-dependent operations). This prevents stalled runners from consuming pipeline minutes indefinitely.

### Secrets

- **Explicit Secret Passing:** When calling reusable workflows, explicitly pass the required secrets:
  ```yaml
  secrets:
    DOCKERHUB_USER: ${{ secrets._TEMP_DOCKERHUB_USER }}
    DOCKERHUB_PASSWORD: ${{ secrets._TEMP_DOCKERHUB_PASSWORD }}
  ```
  Alternatively, use `secrets: inherit` if you trust the downstream workflow and it requires all secrets, like `deployment.yml`.
- **Avoid `toJSON(secrets)`:** Never pass secrets to another workflow by serializing the entire secrets object with `toJSON(secrets)`. This is a security risk as it exposes all environment secrets to potentially untrusted outputs or logs.
