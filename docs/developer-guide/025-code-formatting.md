# Code formatting with Spotless

OpenRemote projects use [Spotless](https://github.com/diffplug/spotless) to apply and verify consistent code formatting and license headers.

Spotless is configured through [Gradle](https://gradle.org/) and is the authoritative implementation of the repository's formatting rules.

## Working directory

Always run Spotless commands from the root directory of the repository, not from an individual Gradle subproject or from the `ui` directory.

For example:

```shell
cd openremote
./gradlew spotlessCheck
```

This also applies to custom projects and other OpenRemote repositories.

## Checking formatting

Before submitting a pull request, check all supported files with:

```shell
./gradlew spotlessCheck
```

This command does not modify files. It fails when one or more files do not comply with the configured formatting rules.

## Integration with Gradle verification

Spotless is included in Gradle's standard `check` lifecycle. Running:

```shell
./gradlew check
```

also runs `spotlessCheck` together with the other configured verification tasks.

Use `spotlessCheck` directly when you only want to check formatting without running the complete verification lifecycle.

## Applying formatting

To automatically format all supported files, run:

```shell
./gradlew spotlessApply
```

Review the resulting changes before committing them. Depending on the file type, Spotless can update:

* code layout;
* imports;
* indentation and whitespace;
* line endings and final newlines;
* license headers.

## Backend and UI tasks

Repositories that separate backend and UI sources, such as `openremote/openremote` and OpenRemote custom projects, provide additional task groups.

To check only backend or UI sources, run:

```shell
./gradlew spotlessBackendCheck
./gradlew spotlessUiCheck
```

To format only backend or UI sources, run:

```shell
./gradlew spotlessBackendApply
./gradlew spotlessUiApply
```

These grouped tasks are not available in every repository. For example, the `openremote/extensions` repository does not separate its Spotless configuration into backend and UI groups. Use the general tasks there:

```shell
./gradlew spotlessCheck
./gradlew spotlessApply
```

Run the following command from the repository root to see which Spotless tasks are available:

```shell
./gradlew tasks --group verification
```

## Formatting an individual file type

Spotless creates tasks for each configured format. This is useful when you only want to check or apply formatting to one type of source file.

For example:

```shell
./gradlew spotlessJavaApply
./gradlew spotlessTypescriptApply
```

The exact tasks and supported file types differ between repositories.

## Java coding convention

Java source code is formatted with [google-java-format](https://github.com/google/google-java-format), which formats Java code according to the [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html).

The formatting convention includes:

* two-space block indentation;
* K&R-style braces;
* consistent line wrapping;
* standardized import ordering;
* removal of unused imports;
* consistent formatting of annotations and Javadoc.

Run Spotless from the repository root to apply or check Java formatting:

```shell
./gradlew spotlessJavaApply
./gradlew spotlessJavaCheck
```

The Google Java Style Guide also contains conventions that cannot be fully enforced by a formatter, including guidance on naming, class structure, programming practices, and documentation. Follow these conventions when writing or reviewing Java code.

IDE integrations such as the IntelliJ IDEA google-java-format plugin can provide immediate feedback, but they may use a different formatter version. The output produced by the repository's Spotless configuration remains authoritative.

## Installing the Git pre-push hook

Spotless provides an optional [Git pre-push hook](https://github.com/diffplug/spotless/blob/main/plugin-gradle/README.md#git-hook) that checks formatting before code is pushed.

Install the hook from the repository root:

```shell
./gradlew spotlessInstallGitPrePushHook
```

After installation, pushing changes runs `spotlessCheck` automatically.

When formatting problems are found, the hook:

1. runs `spotlessApply` to fix the affected files;
2. aborts the push;
3. allows you to review and commit the formatting changes;
4. lets you push again after the changes have been committed.

The hook is installed in the local Git checkout and is not shared automatically with other contributors. Each contributor who wants to use it must install it separately.

The hook provides a useful local safeguard, but it does not replace the formatting checks run by continuous integration.

## UI linting and formatting with Yarn

Projects with a UI and corresponding scripts in their root `package.json`, such as `openremote/openremote` and OpenRemote custom projects, can also run [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) directly with [Yarn](https://yarnpkg.com/).

Run these commands from the repository root.

Check JavaScript and TypeScript with ESLint:

```shell
yarn lint
```

Apply ESLint fixes where possible:

```shell
yarn lint:fix
```

Apply Prettier formatting:

```shell
yarn format
```

Check Prettier formatting without changing files:

```shell
yarn format:check
```

When applying both ESLint fixes and Prettier formatting, run them in this order:

```shell
yarn lint:fix
yarn format
```

ESLint may change imports or code structure. Running Prettier afterwards ensures that the final result is consistently formatted.

These commands provide quick feedback when working exclusively on the UI. They do not completely replace Spotless because Spotless may also:

* format backend and repository-level files;
* apply or verify license headers;
* run additional formatters;
* enforce repository-specific exclusions and rules.

Before pushing changes, run the appropriate Spotless check from the repository root.

## Basic editor settings

The repository-level [EditorConfig](https://editorconfig.org/) file, `.editorconfig`, defines the default text-file settings:

* UTF-8 character encoding;
* Unix-style LF line endings;
* two spaces for indentation;
* spaces instead of tab characters;
* a newline at the end of every file;
* removal of trailing whitespace.

Trailing whitespace is not automatically removed from Markdown files because two trailing spaces can be used to create an explicit Markdown line break.

Most modern IDEs support EditorConfig either directly or through an extension. Enable EditorConfig support and let the repository's `.editorconfig` control these settings.

Avoid overriding the repository settings with conflicting global IDE preferences.

When EditorConfig support is unavailable, configure the editor manually to use:

```text
Encoding: UTF-8
Line endings: LF
Indentation: 2 spaces
Tabs: disabled
Insert final newline: enabled
Trim trailing whitespace: enabled
```

Disable trailing-whitespace removal for Markdown files unless the editor understands Markdown's significant trailing spaces.

## Prettier and ESLint responsibilities

Prettier and ESLint have different responsibilities:

* **Prettier** formats supported UI and documentation files.
* **ESLint** reports JavaScript and TypeScript code-quality problems and applies safe fixes where possible.
* **Spotless** coordinates these tools with the other repository formatters and performs additional checks such as license-header enforcement.

The repository's ESLint configuration disables conflicting formatting rules through `eslint-config-prettier`. Do not configure ESLint as a second general-purpose formatter on top of Prettier.

The recommended save sequence is:

1. Apply ESLint fixes.
2. Format the resulting code with Prettier.
3. Let EditorConfig govern basic text-file properties.

Always use the Prettier and ESLint versions installed by the repository. Avoid configuring an IDE to use unrelated global installations or a personal configuration file.

## IntelliJ IDEA

Useful plugins include:

* [Spotless Gradle](https://plugins.jetbrains.com/plugin/18321-spotless-gradle)
* [google-java-format](https://plugins.jetbrains.com/plugin/8527-google-java-format)

Open the root directory of the repository as the IntelliJ IDEA project. This allows the IDE to discover the Gradle project, root `package.json`, UI configuration files, and `.editorconfig`.

### Configuring Prettier

Open:

```text
Settings
→ Languages & Frameworks
→ JavaScript
→ Prettier
```

Select **Automatic Prettier configuration**. The IDE should use:

* the Prettier package installed by the repository;
* the closest `.prettierrc.json`;
* the applicable `.prettierignore`.

Optionally enable:

* **Run on save**;
* **Run on 'Reformat Code' action**.

Do not select a globally installed Prettier package when the repository package can be detected.

If automatic detection fails, use manual configuration and select the Prettier package provided by the repository. Do not create a separate IDE-only Prettier configuration.

### Configuring ESLint

Open:

```text
Settings
→ Languages & Frameworks
→ JavaScript
→ Code Quality Tools
→ ESLint
```

Select **Automatic ESLint configuration**.

The IDE should use the repository's ESLint installation and locate the configuration nearest to the file being edited.

Optionally enable:

```text
Run eslint --fix on save
```

For repositories with the ESLint configuration in `ui`, specify `ui` as the working directory only when automatic detection does not work correctly.

Use ESLint for inspections and fixes and Prettier for formatting. When both run on save, ESLint fixes should be applied before Prettier formats the resulting code.

Avoid enabling both the built-in JavaScript formatter and Prettier for the same save or reformat action because the two formatters may produce different output.

### Configuring EditorConfig

Ensure that EditorConfig support is enabled:

```text
Settings
→ Editor
→ Code Style
→ Enable EditorConfig support
```

The IDE should display an EditorConfig indicator when editing files covered by the repository configuration.

The repository configuration should take precedence over personal code-style settings for indentation, line endings, final newlines, and trailing whitespace.

## Visual Studio Code

Install these extensions:

* [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [Spotless Gradle](https://marketplace.visualstudio.com/items?itemName=richardwillis.vscode-spotless-gradle)
* [google-java-format](https://marketplace.visualstudio.com/items?itemName=JoseVSeb.google-java-format-for-vs-code)

Open the repository root as the Visual Studio Code workspace. This allows the extensions to discover the root `package.json`, UI configuration files, and `.editorconfig`.

Configure Prettier as the formatter for JavaScript and TypeScript and run ESLint fixes as a save action:

```json
{
  "prettier.requireConfig": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

Equivalent language-specific settings can be added for CSS, HTML, JSON, JSONC, Markdown, and YAML.

Visual Studio Code requires a separate language block for each language. A combined key such as `[javascript][typescript]` does not configure both languages correctly.

For repositories whose ESLint configuration is located in the `ui` directory, automatic detection should normally work. When it does not, add:

```json
{
  "eslint.workingDirectories": ["./ui"]
}
```

Do not set `prettier.configPath` to a personal or global configuration. Doing so can cause the extension to ignore the repository's `ui/.prettierrc.json`.

Similarly, do not set `eslint.options.overrideConfigFile` unless troubleshooting requires it. ESLint should automatically discover the repository configuration.

After configuring the extensions, verify their output against the command-line tools:

```shell
yarn lint
yarn format:check
./gradlew spotlessUiCheck
```

### Recommended Visual Studio Code whitespace settings

EditorConfig should normally manage whitespace settings. When explicit Visual Studio Code defaults are needed, use:

```json
{
  "editor.insertSpaces": true,
  "editor.tabSize": 2,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "[markdown]": {
    "files.trimTrailingWhitespace": false
  }
}
```

These should be fallback settings rather than replacements for `.editorconfig`.

## IDE formatting remains optional

IDE integration provides faster feedback but does not replace the repository commands.

An IDE extension may:

* use a different formatter version;
* fail to locate the correct configuration;
* ignore part of `.prettierignore`;
* apply a built-in formatter before or after Prettier;
* format only the currently opened file.

Before pushing changes, always run:

```shell
./gradlew spotlessCheck
```

For repositories that separate backend and UI sources, a narrower check can be used while developing:

```shell
./gradlew spotlessBackendCheck
./gradlew spotlessUiCheck
```

Run the complete `spotlessCheck` before submitting a substantial or cross-cutting pull request.

## Continuous integration

Pull requests are checked for formatting by GitHub Actions. In repositories with separate backend and UI task groups, the workflow can run the relevant Spotless check based on the files changed by the pull request.

When a Spotless check fails:

1. Run the corresponding `spotlessApply`, `spotlessBackendApply`, or `spotlessUiApply` task locally.
2. Review the changes.
3. Commit and push the formatted files.

Do not manually reproduce the formatter output. The Gradle Spotless tasks are the authoritative formatting implementation.

## Temporarily disabling formatting

Some generated, third-party, or unusually formatted code may not be suitable for automatic formatting. Where the configured formatter supports it, formatting can be temporarily disabled using `spotless:off` and restored using `spotless:on` in the appropriate comment syntax:

```java
// spotless:off
codeThatMustRetainItsOriginalFormatting();
// spotless:on
```

Use this only for small, exceptional sections. Repository-wide exclusions should be added to the central Spotless configuration instead.

## Configuration

The main Spotless configuration is stored in:

```text
spotless.gradle
```

Additional formatter configuration and license-header files may be stored under:

```text
tools/spotless/
```

For projects with a UI, the configuration also uses files such as:

```text
.editorconfig
ui/.eslintrc.json
ui/.prettierignore
ui/.prettierrc.json
package.json
```

Changes to formatting configuration affect the entire repository and should preferably be reviewed separately from ordinary source-code changes.

## Repository-wide formatting workflows

### Applying large formatting changes

A repository-wide `spotlessApply` can modify many files without changing their behavior. Mixing these changes with functional modifications makes pull requests difficult to review and makes later `git blame` results less useful.

When applying a large formatting change:

1. update and review the Spotless configuration first;
2. apply formatting across the repository;
3. keep the generated formatting changes separate from functional changes;
4. commit the formatting changes in a dedicated commit;
5. avoid making manual or behavioral changes in that commit.

A dedicated formatting commit makes the change easier to review and allows it to be excluded from blame history.

### Ignoring formatting commits in Git blame

For large formatting-only commits, add the final commit hash to a [`.git-blame-ignore-revs`](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files#ignore-commits-in-the-blame-view) file in the root of the repository.

For example:

```text
# Applied the initial repository-wide Spotless formatting
0123456789abcdef0123456789abcdef01234567
```

Use the full commit hash and include a comment explaining what the commit changed.

The formatting commit must already exist before its hash can be added. Add the hash to `.git-blame-ignore-revs` in a separate follow-up commit.

When a pull request is squash-merged, use the final commit hash created on the target branch rather than the hash of an intermediate commit from the pull-request branch.

GitHub automatically uses a root-level `.git-blame-ignore-revs` file in its blame view.

To use the file explicitly from the command line, run:

```shell
git blame --ignore-revs-file .git-blame-ignore-revs <file>
```

You can also configure the local repository to use it by default:

```shell
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

This configuration applies to the current repository. Add `--global` only when you intentionally want to use the same ignore-file path for all local repositories.

Only add commits that are overwhelmingly mechanical, such as repository-wide formatting or line-ending changes. Do not ignore commits that contain meaningful functional changes because that would hide useful authorship and history information.

### Updating an existing pull request after repository-wide formatting changes

Pull requests created before the repository-wide formatting commits can produce many merge conflicts, even when their functional changes do not overlap.

For `openremote/openremote`, the relevant commits are:

| Commit                                                                                                                                 | Description                                               |
|----------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| [`d6941d97c96ad70e7a6b764a4a4a7682aa906c8a`](https://github.com/openremote/openremote/commit/d6941d97c96ad70e7a6b764a4a4a7682aa906c8a) | Last commit before the repository-wide formatting change  |
| [`e3a066dcf739efe08d3d0e51e477d2d652dd28f8`](https://github.com/openremote/openremote/commit/e3a066dcf739efe08d3d0e51e477d2d652dd28f8) | Apply Spotless across the repository                      |
| [`5312a1199b0e1cc6daaa46c9b20f2d71a6755246`](https://github.com/openremote/openremote/commit/5312a1199b0e1cc6daaa46c9b20f2d71a6755246) | Enable Spotless formatting for Groovy files               |
| [`db6a1ef6c7bee92ffd6d1855d0aa057f56a028c2`](https://github.com/openremote/openremote/commit/db6a1ef6c7bee92ffd6d1855d0aa057f56a028c2) | Apply repository-wide Spotless formatting to Groovy files |

The `master` branch can be merged into the pull request in stages so that functional changes are handled separately from the generated formatting changes.

1. Fetch the latest repository history:

   ```shell
   git fetch origin
   ```

2. Merge the commit immediately before the Spotless formatting commit:

   ```shell
   git merge d6941d97c96ad70e7a6b764a4a4a7682aa906c8a
   ```

   Resolve any functional conflicts and complete the merge normally.

3. Start merging the repository-wide formatting commit without completing the merge:

   ```shell
   git merge --no-commit e3a066dcf739efe08d3d0e51e477d2d652dd28f8
   ```

   Git may report many conflicts. Do not resolve them individually.

4. Restore the files to their state immediately before this merge while keeping the merge in progress:

   ```shell
   git restore --source=HEAD --staged --worktree -- .
   ```

5. Apply Spotless and complete the merge:

   ```shell
   ./gradlew spotlessApply
   git add --all
   git commit
   ```

6. Merge the commit that enables Spotless formatting for Groovy files:

   ```shell
   git merge 5312a1199b0e1cc6daaa46c9b20f2d71a6755246
   ```

   Resolve any functional conflicts and complete the merge normally. This commit also updates Groovy tests to use syntax supported by the formatter.

7. Start merging the repository-wide Groovy formatting commit without completing the merge:

   ```shell
   git merge --no-commit db6a1ef6c7bee92ffd6d1855d0aa057f56a028c2
   ```

   As with the initial formatting commit, restore the pre-merge file state, regenerate the formatting, and complete the merge:

   ```shell
   git restore --source=HEAD --staged --worktree -- .
   ./gradlew spotlessApply
   git add --all
   git commit
   ```

8. Merge the latest `master` branch as usual:

   ```shell
   git merge origin/master
   ```

   Resolve any remaining functional conflicts normally. Run `spotlessApply` again if resolving a conflict required manual source-code changes.

9. Verify the final result:

   ```shell
   ./gradlew spotlessCheck
   ```

Do not use the `-X ours` merge option for either repository-wide formatting commit. It operates on individual conflicting hunks and can combine formatted and unformatted code into invalid source files.

Do not use the `-s ours` merge strategy either. It would record a formatting commit as merged without applying or regenerating its formatting changes.

### Upgrading an existing custom project to Spotless

Custom projects commonly use the reusable CI/CD workflow from the `master` branch of `openremote/openremote`:

```yaml
uses: openremote/openremote/.github/workflows/ci_cd.yml@master
```

Because this follows `master`, new workflow behaviour is inherited automatically. This includes the Spotless formatting checks.

#### Temporarily pinning the workflow

When there is not yet time to upgrade a custom project, temporarily pin the reusable workflow to a commit from before the Spotless checks were added:

```yaml
uses: openremote/openremote/.github/workflows/ci_cd.yml@51f4c3c0c8edd429a65237268d47d615617d4008
```

Pinning the workflow also prevents the project from receiving other workflow changes made after that commit. Use this only as a temporary measure.

The pinned SHA is the [`51f4c3c0c8edd429a65237268d47d615617d4008`](https://github.com/openremote/openremote/commit/51f4c3c0c8edd429a65237268d47d615617d4008) commit in `openremote/openremote`.

#### Pull request 1: Add Spotless and apply formatting

The first pull request adds the Spotless configuration and applies the initial repository-wide formatting.

##### Synchronizing the Spotless configuration

The required Spotless configuration was added to the custom-project template in two commits:

| Commit                                                                                                                                     | Description                                 |
|--------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| [`3aa39cc8e2134db446d7258d429315fc5615f6e9`](https://github.com/openremote/custom-project/commit/3aa39cc8e2134db446d7258d429315fc5615f6e9) | Add Spotless Gradle plugin configuration    |
| [`ae2e2fb146accfbcacabbdfb7d7909b23711a284`](https://github.com/openremote/custom-project/commit/ae2e2fb146accfbcacabbdfb7d7909b23711a284) | Enable Spotless formatting for Groovy files |

Use the second commit as the reference point because it includes both configuration changes.

Check out the template at this commit:

```shell
git clone https://github.com/openremote/custom-project.git custom-project-template
cd custom-project-template
git checkout ae2e2fb146accfbcacabbdfb7d7909b23711a284
```

Use a directory comparison tool such as [Meld](https://meldmerge.org/) to compare the checked-out template with the existing custom project:

```text
custom-project-template
<existing-custom-project>
```

Synchronize the Spotless-related changes from the template while preserving project-specific configuration. Carefully merge changes to existing files instead of replacing them wholesale.

The exact changes introduced by both Spotless configuration commits can be inspected with:

```shell
git show 3aa39cc8e2134db446d7258d429315fc5615f6e9
git show ae2e2fb146accfbcacabbdfb7d7909b23711a284
```

When other custom-project template updates are also required, compare the existing project with the desired newer template commit and merge those changes in the same way.

##### Commit 1: Add the configuration

Ensure the reusable workflow reference points to `master` before creating the first commit:

```yaml
uses: openremote/openremote/.github/workflows/ci_cd.yml@master
```

Commit the synchronized configuration and workflow change:

```shell
git add --all
git commit -m "Add Spotless configuration"
```

##### Commit 2: Apply the formatting

Apply Spotless:

```shell
./gradlew spotlessApply
```

Verify that the formatted project passes the Spotless checks before committing the generated changes:

```shell
./gradlew spotlessCheck
```

Commit the formatting:

```shell
git add --all
git commit -m "Apply Spotless"
```

Keep the mechanical formatting commit separate from configuration, workflow, and functional changes.

##### Merging pull request 1

Merge the first pull request using **rebase and merge**, not **squash and merge**, so the two commits remain separate on the target branch.

At the bottom of the pull request:

1. Click the dropdown arrow next to the merge button.
2. Select **Rebase and merge**.
3. Click **Rebase and merge**.
4. Confirm the merge when prompted.

GitHub creates new commit hashes when rebasing the commits onto the target branch. The final hash of the `Apply Spotless` commit must therefore be retrieved after the pull request has been merged.

#### Pull request 2: Ignore the formatting commit in Git blame

Fetch the latest target branch and find the full hash of the final `Apply Spotless` commit:

```shell
git fetch origin
git log origin/main --format="%H %s" --grep="^Apply Spotless$" -n 1
```

This prints the complete commit hash followed by its subject. The full hash can also be copied from the commit page on GitHub.

Add the hash to `.git-blame-ignore-revs`:

```text
# Applied the initial repository-wide Spotless formatting
<final-apply-spotless-commit-hash>
```

Commit this change on a new branch and create a separate follow-up pull request:

```shell
git add .git-blame-ignore-revs
git commit -m "Ignore Spotless formatting commit in Git blame"
```

##### Merging pull request 2

Use the normal **squash and merge** method for the second pull request.

At the bottom of the pull request:

1. Click the dropdown arrow next to the merge button.
2. Select **Squash and merge**.
3. Click **Squash and merge**.
4. Confirm the merge when prompted.

Selecting **Squash and merge** for this pull request switches the merge button back to the method normally used for subsequent pull requests.
