# Frontend Testing Guide

<!-- This document describes the frontend test architecture used in this codebase, including the design decisions behind E2E and component testing separation, the fixture system, and setup/teardown strategies. It is intended as a **transfer document** for onboarding or handover purposes. -->

OpenRemote uses [Playwright](https://playwright.dev/) for frontend-testing. Playwright was originally created to enable end-to-end testing i.e. testing through a browser just like how the user would this usually requires the backend to run. Though Playwright added an experimental feature for component testing. Allowing you to use the same Playwright APIs, but on individual components.

## Test Organization

The frontend tests are organized under `component` and `e2e` (end-to-end) tests.

### General setup

All frontend testing code is situated under the `ui` directory. We use different Playwright configurations for `component` and `e2e` testing.

- `ui/playwright-ct-config.ts`: Component testing configuration
- `ui/playwright-config.ts`: End-to-end testing configuration

We do this because we modify the base configuration that comes with the `defineConfig` function for component testing to work, however this configuration is incompatible with e2e testing thus we use 2 configurations.

#### Shared test package

Both `component` and `e2e` depend on the `@openremote/test` package which includes shared fixtures and our Playwright component testing plugin. Playwrights' component testing comes with Vite, but this is incompatible with the `commonjs` imports used in some components.

Playwright uses Vite under the hood for component testing to mount a component to a HTML page. However OpenRemote uses Webpack, and thus we created our own Playwright plugin that mimics this but bundles the component and mounts them through webpack.

### Component test setup

The component tests are used to test individual `lit` (web) based components.

```ts
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'e2e',
      testMatch: /.*\.e2e\.spec\.ts/,
      workers: 1, // One worker to allow shared Manager setup
    },
    {
      name: 'component',
      testMatch: /.*\.component\.spec\.ts/,
      // Parallel execution allowed
    },
  ],
});
```

The setup is based on the

- Dev Server: `@openremote/test`
- `playwright`

##### Configuration

The component tests run in parallel.

- **Target:** UI packages (each component is a standalone NPM package).
- **Runner App:** A dedicated app called `playwright` (used for component mounting).
- **Testing Strategy:** Based on Playwright’s experimental component testing API, but adapted to Webpack using a custom plugin.

### End-to-End test setup

The end-to-end tests are used to test app functionality from the frontend.

##### Configuration

The end-to-end tests run on sequentially using 1 worker to avoid tests interfering with each other.

- **Target:** The `manager` app.
- **Worker Scope:** Single worker (to avoid tests interfering with one-another).
- **Fixtures:** Shared Manager fixture (`scope: 'worker'`) is used for initializing global resources like realm creation, auth sessions, etc.

## Writing tests

**Component test**

**End-to-end test**

Playwright uses [`locators`](https://playwright.dev/docs/locators) to find elements in the DOM. It's crucial to know the different types of locators to be able to write tests that are robust and to avoid flaky behaviour.

### Tips

#### Playwright features

The most useful feature Playwright provides when it comes to writing frontend tests is [UI mode](https://playwright.dev/docs/test-ui-mode). Once the Playwright UI is launched you can select which projects you want to see and run.

The UI includes a locator tab, which allows you to click an element in the test preview to get a selector.

```sh
npm test -- --ui
npm run e2e -- --ui
```

In case you want to see how Playwright runs in a headed browser you can add the `--headed`.

```sh
npm run e2e -- --headed
```

See https://playwright.dev/docs/test-cli#reference for more CLI arguments.

#### Flaky tests

Use `waitFor` and

### Best practices

Please read the [Playwright Best practices](https://playwright.dev/docs/best-practices).

<!-- TODO: include what to do and what not to do -->

**TL;DR**
- Avoid `xpath` and `css` selectors.
- Isolate tests, so you can rerun them without relying on external factors such as other tests.
- Use [web first assertions](https://playwright.dev/docs/test-assertions) e.g. `toBeVisible`, `toBeHidden`, `toBeChecked` etc.
- Reuse locators and actions through test fixtures
- Use the test report, traces and debugger
<!-- - Enable multiple browsers (see playwright UI checkboxes) -->

### Performance
