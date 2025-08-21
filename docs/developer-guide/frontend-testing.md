# Frontend Testing

OpenRemote uses [Playwright](https://playwright.dev/) for frontend testing. Playwright was originally created for end-to-end testing i.e. testing through a browser just like how users would interact with an application. This usually requires the backend to run, making end-to-end tests considerably slower than unit- or component tests. Playwright has added an experimental feature for component testing. Allowing you to use the same Playwright APIs on individual components for better test isolation and easier parallelization.

## Test Organization

The frontend tests are organized under `app` (end-to-end) and `component` tests.

### General setup

All frontend testing code is situated under the `ui` directory.

We use different Playwright configurations for `app` and `component` testing.

- `ui/test/app.config.ts`: App test configuration
- `ui/test/component.config.ts`: Component test configuration

We do this because we modify the base configuration that comes with Playwright so that component testing works, however this configuration is incompatible with app testing thus we use 2 configurations.

#### Shared test package

Both the `app` and `component` tests depend on the `@openremote/test` package which includes shared fixtures, configurations and our Playwright component testing plugin.

The `shared` fixture in the test package is meant for general test utilities like intercepting requests.

Each project that needs testing should configure its own Playwright configuration file which must reuse the above-mentioned configurations.

The plugin for component testing mimics Playwright’s component testing plugin, which normally comes with Vite, but this is incompatible with the `commonjs` imports used in some components. Playwright uses Vite to bundle and mount a component to an empty HTML document for testing. Our Playwright plugin mimics the Vite based plugin using Rspack so we can mount our components to the document without import issues.

### App test setup

The app tests are used to test the app UI (End-to-End).

#### Configuration

- **Target:** Any app in the `ui/app/*` directory.
- **Worker Scope:** Single worker (to avoid tests interfering with one-another).
- **Code reuse:** Apps may include a `fixtures` directory with test and data fixtures, and reuse fixtures from components they depend on.
- **Setup & Teardown:** App test projects should depend on `*.setup.ts` and `*.cleanup.ts` project files to provision realm(s), user(s) and collect authentication states for more robust and performant tests.

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

### Component test setup

The component tests are used to test individual Lit web components.

#### Configuration

- **Target:** Any component in the `ui/component/**` directory.
- **Worker Scope:** Each component runs its own tests in parallel.
- **Code reuse:** Components may include a `fixtures` directory with test and data fixtures, and reuse fixtures from other components they depend on.
- **Setup:** The component test setup includes a dedicated app at `ui/test/playwright` (used to display components and serve static files).

## Writing tests

### Prerequisites

Assuming you have set up your [development tooling](preparing-the-environment#development-tooling).

1. Create a playwright configuration file in your component / app directory. Make sure to include the corresponding playwright configuration files:

|           | config                    |
| --------- | ------------------------- |
| app       | `playwright.config.ts`    |
| component | `playwright-ct.config.ts` |

Playwright configuration file contents:

```ts
import defineConfig from "@openremote/test/<app|component>.config";

export default defineConfig(__dirname);
```

2. Add the corresponding test script to the `package.json` file in your component / app directory.

|           | test script (in package.json)                                        |
| --------- | -------------------------------------------------------------------- |
| app       | `npx playwright test`                                                |
| component | `npx tsc -b && npx playwright test --config playwright-ct.config.ts` |

3. Add the `npmTest` Gradle task to the `build.gradle` file in the component / app directory so that the CI/CD pipeline knows to run your tests.

```groovy
tasks.register('npmTest', Exec) {
    dependsOn getYarnInstallTask()
    commandLine npmCommand("yarn"), "run", "test"
}
```

4. Install the required Playwright browser(s):

```sh
npx playwright install --with-deps chromium
```

See the [Playwright Intro](https://playwright.dev/docs/intro) for more.

5. (Only for apps) The manager app or any app that you would want to test must first be running. The recommended way is to build the manager docker image first using `docker compose -p openremote -f profile/dev-ui.yml up -d --build`. Having the frontend be served by the manager is much faster than serving the frontend using Rspack.

### Writing your first test

To start writing tests using Playwright add a test file ending in `*.test.ts` under your `test` directory.

Then include the following boilerplate for app tests:

```ts
import { test } from "@openremote/test";

test("My app test", async ({ myApp }) => {
})
```

Or the following for component tests:

```ts
import { ct } from "@openremote/test";

import { MyComponent } from "@openremote/or-<my-component>";

ct("My component test", async ({ mount }) => {
  const component = await mount(MyComponent, {
    props: { value: "test" },
    // slots: {},
    // on: {},
  });
})
```

:::note
You must import a component by its alias `@openremote/*`. Relative paths will cause issues. The downsides of the alias import is that this refers to the transpiled typescript `lib` directory, which is why the component test script includes `npx tsc -b`.
:::

Playwright uses [`locators`](https://playwright.dev/docs/locators) to find elements in the DOM. It's crucial to know the different types of locators to be able to write tests that are robust and to avoid flaky behavior.

From here on out you can decide to use any of the Playwright provided web first assertion methods (e.g. `await expect(component).toHaveValue("test")`) and perform actions like clicking a button, see [First test](https://playwright.dev/docs/writing-tests#first-test) for more.

### Reusing test code

You may want to reuse certain `locators` or other test code between your tests, or with other projects. By convention Playwright enables you to configure the environment for each test using [Test Fixtures](https://playwright.dev/docs/test-fixtures). These can be defined by extending the `test` function with your own objects related to their environment like a specific page or component in your application you are writing the test around.

To write a test fixture add a `fixtures` directory under your `test` directory. Then add a TypeScript file usually named after the application, a page in your application or component you're writing the fixtures for. Then create a class for the app, page or component with the common actions you might take, e.g. going to a page.

```ts
export class AssetsPage implements BasePage {
  constructor(private readonly page: Page, private readonly shared: Shared) {}

  async goto() {
    this.manager.navigateToTab("Assets");
  }
}
```

:::note
In case you want to reuse certain non-project specific fixtures across multiple projects you can add your fixture to the `shared` fixtures in the `@openremote/test` package under `ui/test/fixtures/shared.ts`. If you want to reuse component specific fixtures in tests for a parent component or an app, simply import the fixtures and add them through the `extend` function.
:::

Finally extend the `test` method:

```ts
import { test as base, type Page, type ComponentTestFixtures } from "@openremote/test";

interface PageFixtures {
  assetsPage: AssetsPage;
}

interface ComponentFixtures extends ComponentTestFixtures {
  ...
}

interface Fixtures extends PageFixtures, ComponentFixtures {
  myApp: MyApp;
}

export const test = base.extend<Fixtures>({
  // Pages
  assetsPage: async ({ page, shared, baseURL }, use) => await use(new AssetsPage(page, shared)),
  ...
```

And make sure to import the extended `test` function in your test file.

```ts
import { test } from "./fixtures/myApp";

test("My app test", async ({ assetsPage }) => {
})
```

### Running the test

Once you're ready to run your test we recommend opening [Playwright UI mode](#starting-ui-mode) to see your tests in action.

### Starting UI mode

The best way to write tests using Playwright is by using the [Playwright UI mode](https://playwright.dev/docs/test-ui-mode) feature.

You may consider adding the following to the `build.gradle` file in the component / app directory:

```groovy
tasks.register('npmTestUI', Exec) {
    dependsOn getYarnInstallTask()
    commandLine npmCommand("yarn"), "run", "test", "--ui"
}
```

Then run it with:

```sh
gradle ui:component:or-<my-component>:npmTestUI
```

Or simply run `npm test -- --ui` in the component / app directory.

### Best practices

Please read the [Playwright Best practices](https://playwright.dev/docs/best-practices).

**TL;DR**
- Avoid `xpath` and `css` selectors. Relying too heavily on the [Document Object Model (DOM)](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) makes you more prone to breaking tests when a CSS class is renamed or removed, or when nested elements are removed.
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
Sometimes the locators Playwright provides are susceptible to flaky behavior, it is important to understand the DOM structure of the UI to get the most effective locators.
:::

:::tip
In some cases you may face a situation where the UI needs to load first, before you can run an action. You can use `await selector.waitFor()` to ensure the element you want to interact with is visible.
:::

In case you want to see how Playwright runs in a headed browser you can add the `--headed` argument.

```sh
npm run test -- --headed
```

See https://playwright.dev/docs/test-cli#reference for more CLI arguments.
