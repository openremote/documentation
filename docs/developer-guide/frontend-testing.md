# Frontend Testing

OpenRemote uses [Playwright](https://playwright.dev/) for frontend-testing. Playwright was originally created for end-to-end testing i.e. testing through a browser just like how users would interact with an application. This usually requires the backend to run, making end-to-end tests considerably slower than unit- or component tests. Playwright has added an experimental feature for component testing. Allowing you to use the same Playwright APIs on individual components for better test isolation and easier parallelization.

## Test Organization

The frontend tests are organized under `app` (end-to-end) and `component` tests.

### General setup

All frontend testing code is situated under the `ui` directory.

We use different Playwright configurations for `app` and `component` testing.

- `ui/test/config/app.ts`: App test configuration
- `ui/test/config/component.ts`: Component test configuration

We do this because we modify the base configuration that comes with Playwright so that component testing works, however this configuration is incompatible with app testing thus we use 2 configurations.

#### Shared test package

Both the `app` and `component` tests depend on the `@openremote/test` package which includes shared fixtures, configurations and our Playwright component testing plugin.

The `shared` fixture in the test package is meant for general test utilities like intercepting requests. The `components` fixture is specifically meant for utilities related to components to share common actions between app- and component tests.

Each project that needs testing should configure its own Playwright configuration file which must reuse the above-mentioned configurations.

The plugin for component testing mimics Playwright’s component testing plugin, which normally comes with Vite, but this is incompatible with the `commonjs` imports used in some components. Playwright uses Vite to bundle and mount a component to an empty HTML document for testing. Our Playwright plugin mimics the Vite based plugin using Webpack so we can mount our components to the document without import issues.

### Component test setup

The component tests are used to test individual Lit web components.

#### Configuration

The component tests run in parallel.

- **Target:** Any component in the `ui/component/*` directory.
- **Runner App:** The component test setup includes a dedicated app at `ui/test/config/playwright` (used for component mounting).
- **Testing Strategy:** Based on Playwright’s experimental component testing API, but adapted to Webpack using a custom plugin.

### End-to-End test setup

The end-to-end tests are used to test app functionality from the frontend.

#### Configuration

The end-to-end tests run sequentially using 1 worker to avoid tests interfering with each other.

- **Target:** Any app in the `ui/app` directory.
- **Worker Scope:** Single worker (to avoid tests interfering with one-another).
- **Fixtures:** The Manager app includes a `fixtures` directory with test and data fixtures.
- **Setup & Teardown:** The e2e test projects depend on the `*.setup.ts` and `*.cleanup.ts` project files. These projects should be used to provision realm(s), user(s) and collect authentication states for more robust and performant tests.

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

### Prerequisites

Assuming you have set up your [development tooling](preparing-the-environment#development-tooling).

Make sure to include the corresponding playwright configuration and test script command(s):

|           | config                    | test script (in package.json)                                        |
| --------- | ------------------------- | -------------------------------------------------------------------- |
| app       | `playwright.config.ts`    | `npx playwright test`                                                |
| component | `playwright-ct.config.ts` | `npx tsc -b && npx playwright test --config playwright-ct.config.ts` |

Configuration contents:

```ts
import defineConfig from "@openremote/test/config/<app|component>";

export default defineConfig(__dirname);
```

Install the required Playwright browsers:

```sh
npx playwright install --with-deps
```

See the [Playwright Intro](https://playwright.dev/docs/intro) for more.

### Starting UI mode

The best way to write tests using Playwright is by using the [Playwright UI mode](https://playwright.dev/docs/test-ui-mode). Start by adding a test directory if not already present in the project you want to test and add a test file ending in `*.test.ts`.

**App tests**

The manager app or any app that you would want to test must first be running. The recommended way is to build the manager docker image first using `docker compose -p openremote -f profile/dev-ui.yml up -d --build`. Having the frontend be served by the manager is much faster than serving the frontend using Webpack.

Then you can start Playwright in UI mode using the Gradle task.

```sh
gradle ui:app:manager:npmTestUI
# Or run npm test -- --ui in the corresponding directory
```

Playwright uses [`locators`](https://playwright.dev/docs/locators) to find elements in the DOM. It's crucial to know the different types of locators to be able to write tests that are robust and to avoid flaky behavior.

**Component tests**

Run the following task to open the component tests in Playwright UI mode.

```sh
gradle ui:component:or-component:npmTestUI
# Or run npm test -- --ui in the corresponding directory
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
You must import a component by its alias `@openremote/*`. Relative paths will cause issues. The downsides of the alias import is that this refers to the transpiled typescript `lib` directory, which is why the component test script includes `npx tsc -b`.
:::

### Best practices

Please read the [Playwright Best practices](https://playwright.dev/docs/best-practices).

**TL;DR**
- Avoid `xpath` and `css` selectors. Relying too heavy on the [Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) makes you more prone to breaking tests when a CSS class is renamed or removed, or when nested elements are removed.
- Do not use `waitForTimeout` outside of debugging. Tests don't always take the same amount of time which can cause flaky behavior, rather use something like `locator.waitFor()` or even better `page.waitForURL()`.
- Isolate tests, so you can rerun them without relying on external factors such as other tests.
- Use [web first assertions](https://playwright.dev/docs/test-assertions) e.g. `toBeVisible`, `toBeHidden`, `toBeChecked` etc. which use a retry mechanism to avoid flakiness.
- Reuse locators and actions through test fixtures to standardize how to locate specific elements on screen and avoid code duplication in tests.
- Use the Playwright UI mode, test reports, trace viewer and debugger features.
<!-- - Enable multiple browsers (see playwright UI checkboxes) -->

### Tips

The most useful feature Playwright provides when it comes to writing frontend tests is [UI mode](https://playwright.dev/docs/test-ui-mode). Once the Playwright UI is launched you can select which projects you want to see and run.

:::tip
The UI includes a locator tab, which allows you to click an element in the test preview to easily get a locator of an element.
:::

:::warning
Sometimes the locators Playwright provides are susceptible to flaky behavior, it is important to understand the DOM structure of the UI to get the most affective locators.
:::

:::tip
In some cases you may face a situation where the UI needs to load first, before you can run an action. You can use `await selector.waitFor()` to ensure the element you want to interact with is visible.
:::

In case you want to see how Playwright runs in a headed browser you can add the `--headed` argument.

```sh
npm run test -- --headed
```

See https://playwright.dev/docs/test-cli#reference for more CLI arguments.
