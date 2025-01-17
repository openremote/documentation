---
sidebar_position: 8
---

# Creating a custom project

## Quickstart

We have a repo which can be used as a template for a custom project; simply clone the [custom-project](https://github.com/openremote/custom-project) repo and start adding your custom code; see the [Endpoints and file paths](../architecture/manager-endpoints-and-file-paths.md) documentation to understand how to override the various parts of the system.

## What is a custom project

A custom project is a way of extending OpenRemote to provide custom functionality without modifying the main OpenRemote code, thus the custom code can be separately version controlled possibly in a private repo. Possible use cases:

* Custom protocols (to interface with some service/device in a customized way)
* Custom setup code (to automatically provision realms, users, assets, rules, etc. during a clean install)
* Custom asset types
* Custom Docker Compose profiles
* Custom UI apps
* Custom Android/iOS consoles

The guide consists of the following sections and you will need to have a working environment in order to build, test etc. (please refer to the documentation for further details):

* [Project Structure](#project-structure)
* [OpenRemote Dependencies](#openremote-dependencies)
* [Setup code](#setup-code)

## Project Structure

It is recommended to put custom project code in directory/module called `deployment` this can then be built as a Docker image and used as a Docker volume to map into our `manager` and `keycloak` containers to override/enhance their behaviour; if there is a large amount of code then multiple directories/modules might be desired to logically separate the code, in this case it is advised to follow the same naming convention as the main OpenRemote repo and to ensure the `gradle` build `installDist` task is configured in order to copy the compiled code into the `deployment` `build` directory in preparation for building the `deployment` Docker image.

## OpenRemote Dependencies

Depending on what parts of the OpenRemote system are being customized will determine the code dependencies on the main OpenRemote code base.

A custom project always depends on the following released OpenRemote artefacts:

* Docker images - see [Docker Hub](https://hub.docker.com/u/openremote)
* Java modules - see [Maven Central](https://search.maven.org/search?q=g:io.openremote)
* UI components - see [npmjs](https://www.npmjs.com/~openremotedeveloper)

The [Release Management](../user-guide/deploying/release-management) documentation describes how to update the OpenRemote version of these artefacts.

## Custom Project Template

The [custom-project](https://github.com/openremote/custom-project) repo acts as a template for a custom project that uses the OpenRemote dependencies; you can clone this repo as a starting point for a new custom project, the layout of this repo is as follows:

* `/deployment` - Directory/module for custom code/files
* `/gradle` - Gradle files
* `.gitignore` - Typical `.gitignore` file to exclude common build related files/directories (also excluded `*.mbtiles` as these can be very large binary files not suitable for a git repo)
* `gradlew`/`gradlew.bat` - Gradle wrapper execution script
* `build.gradle` - Gradle root project build config
* `gradle.properties` - Gradle properties file
* `settings.gradle` - Gradle multi project config
* `LICENSE.txt` - Copy of `LICENSE.txt` from main OpenRemote repo

### Deployment directory/module

This module is used to generate a `deployment` Docker image which can be volume mapped into the manager and/or Keycloak containers to customize their behaviour. The `installDist` Gradle task of this module will generate output in the `/deployment/build` directory in particular:

* `/deployment/build/image` - Content to be added to the deployment Docker image at `/deployment`
* `/deployment/build/Dockerfile` - Docker build file used to build `deployment` Docker image (copied from `/deployment` during `installDist`) 

### Adding new modules

Create directory with appropriate name and copy `/deployment/build.gradle` into it, customize this new `build.gradle` as required and start adding your code/files, ensuring that the `installDist` Gradle task copies any output into the appropriate location within the deployment Docker image build directory (see the [Manager endpoints and file paths](../architecture/manager-endpoints-and-file-paths.md)).

### Adding UI apps/components

It is recommended to use the same directory layout as found in the `openremote` repository, and add additional UI code in the `ui` directory.
Our UI code uses `yarn workspaces` so you can add any additional workspace paths to the `package.json` file in the root directory of the custom project.

### Custom Keycloak themes

It's possible to provide custom Keycloak themes see [custom-project](https://github.com/openremote/custom-project/blob/main/deployment/keycloak/themes/README.md) for details.

## Setup code

Custom setup code allows for programmatic configuration of a clean installation including the provisioning of `Agents`, `Assets`, `users`, `rules`, etc. This means that the system loads in a pre-configured state that can easily be reproduced after a clean install. Setup code is executed via the `SetupService` and is only executed if the `OR_SETUP_RUN_ON_RESTART` environment variable is set to `true` or if the database that the instance uses is empty.

To write custom setup code then you need to create implementations of `SetupTasks` these are then discovered using the standard java `ServiceLoader` mechanism and must therefore be registered via `META-INF/services` mechanism, generally implementations should extend the `EmptySetupTasks` which will do basic configuration of `keycloak` which is essential, see [custom-project](https://github.com/openremote/custom-project/blob/main/setup/src/main/java/org/openremote/manager/setup/custom/CustomSetupTasks.java) for details.
