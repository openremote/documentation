---
id: ci-cd-pipeline
title: CI/CD Pipeline
sidebar_label: CI/CD Pipeline
---

# CI/CD Pipeline

This document describes the continuous integration and continuous deployment (CI/CD) pipeline for OpenRemote, introducing the concepts and workflows added in our recent pipeline migration (introduced in PR [#2696](https://github.com/openremote/openremote/pull/2696)).

## How to make changes to the pipeline and test them

When modifying the pipeline, you should generally branch off `master` and test your changes by opening a Pull Request. Since the workflows run automatically for PRs, you can iterate on pipeline changes within the PR itself.

To test changes without polluting the main repository, you can:
1. Push to your own fork and test against custom branches.
2. Test dispatchable workflows manually. Note that if a workflow file has not been merged to `master` yet, you cannot trigger it from the GitHub Actions UI. Instead, you must use the [GitHub CLI](https://cli.github.com/) to trigger it on your feature branch:
   ```bash
   gh workflow run <workflow-name.yml> --ref <your-feature-branch>
   ```
   * **Note on new dispatchable workflows:** If you are adding a completely new workflow file, it won't be recognized by GitHub at all until it is registered. A common workaround is to temporarily add an `on: [push]` event to the workflow, push your branch so it runs once, and then remove the `push` event. After this, it will be available to trigger via the CLI.

## "Environment" and "Job" Workflows

The pipeline is structured using a separation of concerns between environments and jobs:

- **Environment Workflows**: These are entry points that handle specific contexts (e.g., `review.yml` for Pull Requests, `staging.yml` for push to `master` and releases, `custom-review.yml` and `custom-staging.yml` for custom projects). They act as the orchestrator for different triggers.
- **Job Workflows**: These are reusable workflows (`workflow_call`) that contain the actual steps for specific tasks (like running tests, building dists, or publishing artifacts). Environment workflows call these job workflows, which prevents duplication.

### How Reusable Workflows Work
Job workflows are configured as reusable workflows. This allows them to be shared across multiple environment orchestrators.

**Handling Skipped Jobs:**
Because GitHub Actions treats skipped jobs differently in the status check context (a skipped job in a required chain might cause downstream dependencies to hang or fail incorrectly), you often need to handle skipping *inside* the reusable workflow itself rather than skipping the entire `workflow_call`. This is achieved by checking conditionals within the steps or the jobs of the reusable workflow to exit cleanly.

## Deployments

Deployments are handled by the `deploy.yml` dispatch workflow. This workflow can be triggered manually or via specific staging outcomes. For deployments to test servers, the setup has been minimized to reduce the deployment time significantly.

## Optimizing Jobs and Job Dependencies

We utilize several strategies to ensure the pipeline is as fast and efficient as possible:

### Detect Changes
We use a "detect changes" job early in the workflow to determine which files have been modified. Subsequent jobs use the outputs of this job to conditionally skip themselves. This is why UI tests don't run if only backend Java code was touched, significantly speeding up the pipeline.

### Minimal Dependency Installation
Jobs should only install what they need. For Node/Yarn-based projects, instead of running a full `yarn install` everywhere, we use focused installs, e.g., `yarn focus @openremote/util @openremote/test`. This installs the bare minimum dependencies for the scoped workspace, drastically reducing setup time.

### Checking out with Git LFS
Only use `lfs: true` in the `actions/checkout` step if the job actually requires large files (like images, binaries, or specific test assets). Checking out LFS files adds significant time and bandwidth overhead, so it is omitted where unnecessary.

### Build Tooling and File Modified Metadata Tricks
To avoid rebuilding components when passing artifacts between jobs, we use tricks like updating file modified metadata (e.g., using `touch`) after downloading artifacts. This tricks build tools (like Gradle) into recognizing that the downloaded artifact is the newest version, preventing the tool from re-triggering unnecessary compilations.

## Artifacts: When and What to Include

Artifacts are used to share files between isolated jobs.

**The most important rule for artifacts is to split them where possible and create artifacts containing only the bare necessities for each specific job.**

- **What to include:** Compiled distributions, test reports, and coverage files. Do not upload `node_modules` or full `build` folders; compress and selectively upload only the required distributions.
- **When to use them:** Only pass artifacts when a downstream job strictly requires the output of an upstream job. Artifact upload/download takes time and consumes storage. Avoid sharing sensitive data through public artifacts.
- **Optimization through splitting:** Uploading separate, minimal artifacts (e.g., saving the manager dist and UI dists as separate artifacts rather than one massive archive) ensures downstream jobs only download exactly what they need, significantly speeding up the pipeline.

## Configuration: Gradle vs. Workflows

A good rule of thumb is:
- **Use Gradle** to manage the internal build lifecycle, task graphs, dependencies, and code compilation.
- **Use Workflows** for orchestration, conditional job execution (e.g., detect changes), environment provisioning, and deployment.

If a task can be optimized or defined within Gradle (such as skipping a task with `-x`), prefer that over complex bash scripts in the workflow. However, if skipping a process depends on the GitHub PR context (like changes to specific directories), manage it at the workflow level.

## Caching Strategies

We implement several caching strategies to speed up builds:
- **Docker Images:** Docker layer caching is used to avoid rebuilding unmodified layers. We utilize the GitHub Actions cache backend for Docker buildx.
<!-- - **Gradle & Yarn Caches:** Dependency caches for Gradle (`~/.gradle/caches`) and Yarn are restored at the beginning of jobs to skip downloading external libraries. -->

## GitHub Concepts

### Composite Actions
Composite actions are defined under `.github/actions/` and act as reusable steps (unlike reusable workflows, which act as reusable jobs). We use them to keep things DRY.
To write or update a composite action:
1. Create an `action.yml` file in a dedicated folder.
2. Define `runs: using: "composite"`.
3. Reference the action in a workflow using `uses: ./.github/actions/your-action-name`.

### Special Conditions
You will often see special conditionals used in the pipeline:
- `if: always()`: Ensures a step runs regardless of whether previous steps failed. This is typically used to ensure test results and coverage reports are uploaded even when tests fail.
- `if: failure()`: Used to clean up environments or post error notifications only when a job crashes.

## Good and Bad Practices

### Good Practices
- **Timeout restrictions:** Always add `timeout-minutes: 20` (or an appropriate limit) to any step or job that could potentially hang (such as tests or network-dependent operations). This prevents stalled runners from consuming pipeline minutes indefinitely.
- **Explicit Secret Passing:** When calling reusable workflows, explicitly pass required secrets using `secrets: { MY_SECRET: ${{ secrets.MY_SECRET }} }`. Alternatively, use `secrets: inherit` if you trust the downstream workflow.

### Bad Practices
- **Avoid `toJSON(secrets)`:** Never pass secrets to another workflow by serializing the entire secrets object with `toJSON(secrets)`. This is a security risk as it exposes all environment secrets to potentially untrusted outputs or logs.
