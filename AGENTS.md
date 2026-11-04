
# OpenRemote Documentation - Agent Instructions

This repository contains the documentation for [OpenRemote](https://github.com/openremote/core), a 100% open-source IoT platform for device management, automation, data integration, and visualization.

The documentation website is built using [Docusaurus](https://docusaurus.io/) and published at https://docs.openremote.io/.

## Project references

- [Documentation README](README.md) - Primary source of instructions for this documentation repository, including writing conventions, versioning, development, testing, and deployment.
- [OpenRemote Core](https://github.com/openremote/core) - Main OpenRemote platform source code.
- [OpenRemote Core README](https://github.com/openremote/core/blob/main/README.md) - Product overview, architecture, and development information.
- [OpenRemote Keycloak](https://github.com/openremote/keycloak) - Customized Keycloak Docker image and OpenRemote authentication theme.
- [OpenRemote Custom Project](https://github.com/openremote/custom-project) - Template for developing custom OpenRemote projects and extensions.
- [OpenRemote Proxy](https://github.com/openremote/proxy) - HAProxy Docker image and reverse proxy configuration.

**Always read this repository's [README.md](README.md) before making documentation changes.**
It is the authoritative reference for documentation-specific instructions and workflows.

This `AGENTS.md` defines additional restrictions for AI agents.
Where its restrictions conflict with maintenance procedures in the README, agents must follow the restrictions in this file.

Use the other repositories as references for product implementation details, configuration, APIs, deployment, and integration behavior.
Their README files describe their respective components and do not replace this repository's documentation instructions.

## Repository structure

- `docs/` - Documentation for the next OpenRemote release (Next).
- `versioned_docs/` - Documentation snapshots of released versions.
- `versioned_sidebars/` - Sidebar configurations for released versions.
- `versions.json` - Released versions included in the website.
- `api/` - Externally managed OpenAPI specifications.
- `static/` - Static website assets.
- `src/` - Docusaurus components, pages, and styling.
- `sidebars.ts` - Documentation navigation.
- `docusaurus.config.ts` - Docusaurus configuration.

## Documentation changes and versioning

- Make ordinary documentation changes only in `docs/`, which contains the Next documentation.
- Treat `versioned_docs/`, `versioned_sidebars/`, and `versions.json` as read-only unless the task explicitly requires changes to released documentation or documentation versioning.
- Do not automatically propagate changes from `docs/` to released documentation versions.
- If a correction also applies to a released version, mention the potential need for a backport rather than performing it automatically.
- Ensure documented functionality is appropriate for the OpenRemote release being described.
- Do not create new documentation versions unless explicitly requested.
- Keep changes focused on the requested documentation. Avoid unrelated formatting changes, file moves, and reorganizations.

## Writing guidelines

- Use US English spelling, grammar, and terminology for all new or modified documentation.
- Do not rewrite unrelated documentation solely to standardize spelling or terminology.
- Follow the existing documentation structure, terminology, and writing style.
- Write clear, concise, technically accurate documentation using Markdown or MDX.
- Prefer Markdown syntax over HTML tags whenever Markdown provides equivalent functionality. Use HTML or MDX components only when necessary.
- Prefer direct language and active voice. Avoid unnecessary repetition and promotional language.
- Prefer one sentence per source line in new or substantially edited Markdown prose to produce cleaner diffs. Keep sentences belonging to the same paragraph together without blank lines.
- Do not reformat unrelated existing paragraphs solely to apply the one-sentence-per-line convention.
- Format Markdown tables with consistently aligned columns and properly aligned separator rows to keep them readable in the source. Preserve existing table formatting when making unrelated changes.
- Use descriptive headings, short paragraphs, and practical examples where useful.
- Use consistent OpenRemote terminology and preserve the exact names of UI elements, configuration properties, APIs, and commands.
- Use inline code formatting for filenames, paths, commands, configuration properties, and code identifiers.
- Use fenced code blocks with appropriate language identifiers.
- When documenting procedures, include prerequisites, steps, and expected results where appropriate.
- Prefer updating existing pages over introducing duplicate documentation.
- Preserve existing technical content and wording when it is already accurate and clear. Avoid unnecessary stylistic rewrites.
- Preserve existing front matter, document identifiers, URLs, and heading anchors unless changes are necessary.
- Follow existing file and directory naming conventions, including numeric prefixes used for sidebar ordering.
- Follow existing autogenerated sidebar conventions and use `_category_.json` metadata where appropriate.
- Do not modify `sidebars.ts` merely to add a page that is already included through autogenerated navigation.
- Use Docusaurus admonitions for important notes, tips, and warnings when appropriate, but avoid overusing them.

## Technical accuracy

- Use the relevant OpenRemote source repositories as the primary references for implementation details.
- Verify documented commands, configuration properties, API endpoints, and code examples against the implementation when possible.
- When documenting a released version, consult the corresponding release tag or version of the relevant OpenRemote source repository where available.
- Do not assume that behavior on the `main` branch also applies to older releases.
- Do not invent configuration options, API behavior, product capabilities, or compatibility information.
- If a technical detail cannot be verified, report the uncertainty rather than presenting an assumption as fact.
- Preserve technically meaningful details when simplifying or rewriting existing documentation.
- Never include private credentials, API tokens, secrets, or personal information.
- Use placeholders in examples unless documenting publicly known default or demo credentials, which must be clearly identified as such.

## Links and images

- Use relative Markdown links to other documentation files, including their `.md` or `.mdx` extensions.
- Do not use absolute `docs.openremote.io` URLs or site-root paths for internal documentation links.
- Verify that relative links and image references resolve correctly.
- Use descriptive link text rather than generic phrases such as "click here".
- Use relative paths for images and keep them close to the documentation that uses them.
- Include meaningful alternative text for images.
- Optimize new images before committing them to avoid unnecessarily increasing repository size across documentation versions.

See the README for detailed guidance on Docusaurus links, images, and Markdown features.

## Generated API documentation

The REST and provisioning API documentation is generated from OpenAPI specifications managed outside this repository.

- Treat `api/`, `docs/rest-api/`, `docs/provisioning-api/`, and their corresponding directories under `versioned_docs/` as read-only.
- Do not modify OpenAPI specifications or generated API documentation.
- Do not run OpenAPI documentation generation or cleanup commands.
- These restrictions also apply when the README describes API generation procedures for maintainers.
- If a task requires changes to these files, report that they are externally managed rather than modifying them.

These files may be read and referenced when verifying technical documentation.

## Docusaurus configuration and dependencies

- Avoid modifying Docusaurus configuration, sidebars, dependencies, or build tooling unless required by the task.
- Do not modify generated build output or dependency directories such as `build/`, `.docusaurus/`, or `node_modules/`.
- Use the Yarn version configured in `package.json`.
- Do not modify `yarn.lock` manually. Use Yarn to update dependencies and the lockfile when dependency changes are explicitly requested.

## Validation

- Review changed files for correctness, consistency, and unintended modifications.
- Run `git status --short` to identify new, modified, and unexpected files.
- Run `git diff --check` to detect whitespace errors.
- Check changed links, image references, headings, and code examples.
- Routine Markdown changes can normally rely on the GitHub Actions CI build.
- Run `yarn build` for substantial structural, navigational, configuration, or versioning changes when feasible.
- Use `yarn start` to preview Next documentation and `yarn serve` to inspect a production build when useful.
- Do not claim that CI or local validation succeeded unless it was actually performed successfully.
- Report validation that could not be performed.

Refer to the [Documentation README](README.md) for additional development, validation, and release procedures.
