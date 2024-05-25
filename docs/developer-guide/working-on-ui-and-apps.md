---
sidebar_position: 5
---

# Working on UI and apps

## Overview
Front end applications are [webcomponent](https://www.webcomponents.org/) based using the [lit](https://lit.dev/) library and [Material Design](https://material.io/components?platform=web) for styling. We use a combination of Polymer LIT, Material Design and our own OpenRemote elements. The UI components are [published on NPM](https://www.npmjs.com/~openremote). The applications themselves are composed of our re-usable modular UI components which can be found in the code base in the [ui/component](https://github.com/openremote/openremote/tree/master/ui/component) folder, these are also published to [NPM](https://www.npmjs.com/~openremotedeveloper).

## Working on an app (e.g. Manager UI)
To work on an app for example the `Manager UI` then `cd` into the app directory e.g. `ui/app/manager` and run the following `npm` script:

- `npm run serve` - Compiles the typescript model from java code and then starts webpack dev server and serves the web app which can then be accessed at `http://localhost:9000/manager/` (**NOTE: trailing `/` is required**)

### Webpack dev server environment variables
The following environment variables can be set when running `npm run serve` using the syntax `npm run serve -- --env ENV_NAME=ENV_VALUE`:

* config - To apply a custom `manager_config.json` you can set the `config` environment variable on the `npm run serve` command using a path relative to the `app/manager` directory e.g. 
   * Windows: `npm run serve -- --env config=..\..\..\..\deployment\manager\app`
   * Mac: `npm run serve -- --env config=../../../../deployment/manager/app`
* managerUrl - By default webpack dev server expects the manager to be available at `http://localhost:8080` but this can be configured for example when running the manager docker image (e.g. `npm run serve -- --env managerUrl=https://localhost`)
* keycloakUrl - By default keycloak expects to be available at `managerUrl/auth` but this can be configured for example when running the manager docker image (e.g. `npm run serve -- --env keycloakUrl=https://keycloak/auth`)


## Consuming UI components

Components are published as ES6 modules (for use in bundlers like webpack) and are also pre-bundled for direct consumption.


## UI development

Doing development on the UI means working on any of: 

* Front end applications
* Front end components and their demos, shared between applications
* Keycloak theme(s) used in authentication screens

You will need the standard tool chain (see [Preparing the environment](preparing-the-environment.md) to be able to build and run the components and apps. Working on the web applications and/or components will also generally require backend services to interact with, you can either:

* Run a Manager instance in an IDE (refer to [Setting up an IDE](setting-up-an-ide.md))
* Deploy the Manager using a Docker container (refer to [UI Development profile](docker-compose-profiles.md#ui-development-dev-uiyml))

If you want to create a new `component` or `app` then simply copy an existing one as a template (when creating a `component` then you may need to create a corresponding `demo` which acts as a development harness that can be served by webpack dev server - one demo may act as harness for multiple components).

### UI Components & Apps (`/ui`)
All UI components and apps are located in the `ui` directory; here you can find the standard OpenRemote web UI components and apps using a monorepo architecture. The code is divided into categories by directory:
* [`component`](https://github.com/openremote/openremote/tree/master/ui/component) - Base OpenRemote JS modules and web components (built using Polymer) these are written as ES6 modules
* [`app`](https://github.com/openremote/openremote/tree/master/ui/app) - Built-in OpenRemote web applications (applications can be built with whatever frameworks/libraries are desired)
* [`demo`](https://github.com/openremote/openremote/tree/master/ui/demo) - Demos of each web component (provides a development harness for developers working on the components)

Typescript is used to provide static typing with the OpenRemote model available in the `@openremote/model` component package; the components are published to `npm` under the `@openremote` scope; see the README in each component for information about each specific component.

Yarn workspaces are used to symlink the OpenRemote packages into a root `node_modules` directory (refer to the Yarn [documentation](https://yarnpkg.com/) for more details). Yarn acts as an alternative to `npm` so please use it.

NPM scripts are used for build and development purposes (the main build tool for the entire code base is `gradle` so there are `gradle` tasks that launch NPM scripts - these `gradle` tasks have the prefix `npm` followed by the NPM script name e.g. `npmBuild`).

The following standard NPM scripts are used throughout the components and apps for consistency:

* `clean` - Cleans up any build artefacts (typically uses the [`shx`](https://www.npmjs.com/package/shx) package)
* `build` - Build the component/app ready for publishing/deployment
* `test` - Run any automated tests
* `modelWatch` - Starts a `gradle` task to watch the `java` model code and to run the `typescript` generator when changes are detected, the generated `model` and `restclient` typescript code is then transpiled to `javascript`
* `modelBuild` - Similar to `modelWatch` but just does a onetime build rather than watching for changes
* `serve` - Starts `webpack dev server` typically on `http://localhost:9000/[app|demo]/`

The above script names should be used in `package.json` files and then appropriate `build.gradle` files should be added, see existing components, apps, demos for examples. Typically only the `apps` need to be built by `gradle` tasks as typescript should follow project references and compile any dependent components.

### Components
Components can be developed and tested in isolation (with dependencies on other components and/or public npm modules as required). Some components have no visuals and provide standard OpenRemote functionality e.g. `@openremote/core`, whilst others provide visuals that allow interaction with the Manager backend.

### Maps
If you are working on a map component then please refer to the [working on maps](working-on-maps.md).

### Apps
Apps bring together components and/or public NPM modules and can be written using any framework/library etc that is
compatible with web components (see [here](https://custom-elements-everywhere.com/)).

### Demos
These are apps for development purposes Generally a 1-1 mapping between components and demos; they provide a simple harness for the components that can be used during development and optionally can be deployed to offer component demos. 

## Publishing to NPM
Publishing is done using lockstep versioning; we use yarn version plugin to manage workspace package version incrementing as follows:

1. The public packages are marked for version bump:
`yarn workspaces foreach --no-private --topological version --deferred <patch | minor | major>`
1. The new versions are applied:
`yarn version apply --all`
1. The components are prepared:
`yarn workspaces foreach --no-private --topological npm prepublishOnly`
1. The public packages are packed and published:
`yarn workspaces foreach --no-private --topological npm publish`
