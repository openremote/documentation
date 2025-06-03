# Frontend Testing

OpenRemote uses [Playwright](https://playwright.dev/) for frontend-testing. Playwright was originally created for end-to-end testing i.e. testing through a browser just like how the user would interact with an application. This usually requires the backend to run, making them considerably slower than unit- or component tests. Playwright has added an experimental feature for component testing. Allowing you to use the same Playwright APIs on individual components for better test isolation and easier parallelization.

## Test Organization

The frontend tests are organized under `component` and `e2e` (end-to-end) tests.

### General setup

All frontend testing code is situated under the `ui` directory. We use different Playwright configurations for `component` and `e2e` testing.

- `ui/playwright-ct-config.ts`: Component testing configuration
- `ui/playwright-config.ts`: End-to-end testing configuration

We do this because we modify the base configuration that comes with the `defineConfig` function for component testing to work, however this configuration is incompatible with E2E testing thus we use 2 configurations.

#### Shared test package

Both the `component` and `e2e` tests depend on the `@openremote/test` package which includes shared fixtures and our Playwright component testing plugin. Playwrights' component testing plugin comes with Vite, but this is incompatible with the `commonjs` imports used in some components. Playwright uses Vite to bundle and mount a component to an empty HTML document for testing. Our Playwright plugin mimics the Vite based plugin using Webpack so we can mount our components to the document without import issues.

The `shared` fixture in the test package is meant for general test utilities like intercepting requests. The `components` fixture is specifically meant for utitilies related to components to share common actions between component- and E2E tests.

### Component test setup

The component tests are used to test individual Lit web components.

#### Configuration

The component tests run in parallel.

- **Target:** Any component in the `ui/component/*` directory.
- **Runner App:** The component test setup includes a dedicated app at `ui/playwright` (used for component mounting).
- **Testing Strategy:** Based on Playwright’s experimental component testing API, but adapted to Webpack using a custom plugin.

### End-to-End test setup

The end-to-end tests are used to test app functionality from the frontend.

#### Configuration

The end-to-end tests run sequentially using 1 worker to avoid tests interfering with each other.

- **Target:** Any app in the `ui/app` directory.
- **Worker Scope:** Single worker (to avoid tests interfering with one-another).
- **Fixtures:** The Manager app includes a `fixtures` directory with test and data fixtures (`scope: 'worker'`).
- **Setup & Teardown:** The e2e test projects depend on the `*.setup.ts` and  `*.cleanup.ts` project files. These projects should be used to provision realm(s), user(s) and collect authentication states for more robust and performant tests.

```ts
function createAppSetupAndTeardown(app) {
  return [
    {
      name: `setup ${app}`,
      testMatch: "**/*.setup.ts",
      teardown: `cleanup ${app}`,
      worker: 1,
    },
    {
      name: `cleanup ${app}`,
      testMatch: "**/*.cleanup.ts",
      worker: 1,
    },
  ];
}
```

## Writing tests

The best way to write tests using Playwright is by using the [Playwright UI mode](https://playwright.dev/docs/test-ui-mode). Start by adding a test directory if not already present in the project you want to test and add a test file ending in `*.test.ts`.

**Component tests**

Run the following command to open the component tests in Playwright UI mode.

```sh
npm test -- --ui
```

Component tests normally include the following boilerplate:

```ts
import { ct } from "@openremote/test";

import { MyComponent } from "@openremote/or-<my-component>";

ct("My component test", async ({ mount }) => {
  const component = await mount(MyComponent, {
    props: { value: "test" },
    // slots: {},
    // on: {},
  });
  // await expect(component).toHaveValue("test");
})
```

:::note
You must import a component by its alias `@openremote/*`. Relative paths will cause issues. The downsides of the alias import is that this refers to the transpiled typescript `lib` directory, which you must manually update after making change to a component. You can update this using `gradle ui:component:my-component:npmBuild`.
:::

**End-to-end tests**

The manager app or any app that you would want to test must first be running. The recommended way is to build the manager docker image first using `docker compose -p openremote -f profile/dev-ui.yml up -d --build`. Having the frontend be served by the manager is much faster than serving the frontend using Webpack.

Then you can start the Playwright in UI mode using the following command.

```sh
npm run e2e -- --ui
```

Playwright uses [`locators`](https://playwright.dev/docs/locators) to find elements in the DOM. It's crucial to know the different types of locators to be able to write tests that are robust and to avoid flaky behaviour.

### Tips & Best practices

The most useful feature Playwright provides when it comes to writing frontend tests is [UI mode](https://playwright.dev/docs/test-ui-mode). Once the Playwright UI is launched you can select which projects you want to see and run.

:::tip
The UI includes a locator tab, which allows you to click an element in the test preview to easily get a locator of an element.
:::

:::warning
Sometimes the locators Playwright provides are suseptible to flaky behavior, it is important to understand the DOM structure of the UI to get the most affective locators.
:::

:::tip
In some cases you may face a situation where the UI needs to load first before you can run an action. You can use `await selector.waitFor()` to ensure the element you want to interact with is visible.
:::

In case you want to see how Playwright runs in a headed browser you can add the `--headed` argument.

```sh
npm run e2e -- --headed
```

See https://playwright.dev/docs/test-cli#reference for more CLI arguments.

Please read the [Playwright Best practices](https://playwright.dev/docs/best-practices).

<!-- TODO: include what to do and what not to do -->

**TL;DR**
- Avoid `xpath` and `css` selectors.
- Isolate tests, so you can rerun them without relying on external factors such as other tests.
- Use [web first assertions](https://playwright.dev/docs/test-assertions) e.g. `toBeVisible`, `toBeHidden`, `toBeChecked` etc.
- Reuse locators and actions through test fixtures
- Use the test reports, trace viewer and debugger
<!-- - Enable multiple browsers (see playwright UI checkboxes) -->
