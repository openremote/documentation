---
sidebar_position: 8
---

# Creating a custom project

## Quickstart
We have a repo which can be used as a template for a custom project; simply clone the [custom-project](https://github.com/openremote/custom-project) repo and start adding your custom code; see the [Endpoints and file paths](../architecture/manager-endpoints-and-file-paths.md) documentation to understand how to override the various parts of the system.

## What is a custom project
A custom project is a way of extending OpenRemote to provide custom functionality without modifying the main OpenRemote code, thus the custom code can be separately version controlled possibly in a private repo. Possible use cases:

* Custom protocols (to interface with some service/device in a customised way)
* Custom setup code (to automatically provision realms, users, assets, rules, etc. during a clean install)
* Custom asset types
* Custom docker compose profiles
* Custom UI apps
* Custom Android/iOS consoles

The guide consists of the following sections and you will need to have a working environment in order to build, test etc. (please refer to the wiki for further details):

* [Project Structure](#project-structure)
* [OpenRemote Dependencies](#openremote-dependencies)
* [Setup code](#setup-code)

## Project Structure

It is recommended to put custom project code in directory/module called `deployment` this can then be built as a docker image and used as a docker volume to map into our `manager` and `keycloak` containers to override/enhance their behaviour; if there is a large amount of code then multiple directories/modules might be desired to logically separate the code, in this case it is advised to follow the same naming convention as the main OpenRemote repo and to ensure the `gradle` build `installDist` task is configured in order to copy the compiled code into the `deployment` `build` directory in preparation for building the `deployment` docker image.



## OpenRemote Dependencies
Depending on what parts of the OpenRemote system are being customised will determine the code dependencies on the main OpenRemote code base; as the main OpenRemote code base is a monolith repo it is possible to add a `git submodule` to the main OpenRemote repo and directly reference the `gradle` projects within, this gives a very tight development process which is particularly useful if making code changes within the OpenRemote code base at the same time, to do this use the standard `git submodule` command (refer to git documentation for working with submodules):
```
git submodule add -b master https://github.com/openremote/openremote.git openremote/
```

An alternative is to reference release artefacts of our various modules:

* java modules - see maven repo (TODO)
* UI components - see [npm](https://www.npmjs.com/~openremotedeveloper)


## Custom Project Template
The [custom-project](https://github.com/openremote/custom-project) repo acts as a template for a custom project that references the OpenRemote dependencies using a `submodule`; you can clone this repo as a starting point for a new custom project, the layout of this repo is as follows:

* `/deployment` - Directory/module for custom code/files
* `/gradle` - Gradle files
* `/openremote` - OpenRemote repo submodule
* `.gitignore` - Typical `.gitignore` file to exclude common build related files/directories (also excluded `*.mbtiles` as these can be very large binary files not suitable for a git repo)
* `gradlew`/`gradlew.bat` - Gradle wrapper execution script
* `build.gradle` - Gradle root project build config
* `gradle.properties` - Gradle properties file
* `settings.gradle` - Gradle multi project config (loads OpenRemote submodule projects)
* `LICENSE.txt` - Copy of `LICENSE.txt` from main OpenRemote repo

### Deployment directory/module
This module is used to generate a `deployment` docker image which can be volume mapped into the manager and/or keycloak containers to customise their behaviour. The `installDist` gradle task of this module will generate output in the `/deployment/build` directory in particular:

* `/deployment/build/image` - Content to be added to the deployment docker image at `/deployment`
* `/deployment/build/Dockerfile` - Docker build file used to build `deployment` docker image (copied from `/deployment` during `installDist`) 

### Adding new modules
Create directory with appropriate name and copy `/deployment/build.gradle` into it, customise this new `build.gradle` as required and start adding your code/files, ensuring that the `installDist` gradle task copies any output into the appropriate location within the deployment docker image build directory (see the [Manager endpoints and file paths](../architecture/manager-endpoints-and-file-paths.md)).

### Adding UI apps/components
It is recommended to use the same directory layout as found in the `openremote` submodule, and put all UI code in a directory called `ui`; as our UI code uses `yarn workspaces` you will need to copy the `/openremote/package.json` into the root of the custom project and then modify the workspace paths within this new file (adding `openremote/` in front of existing paths and also adding new paths for any components or apps created in the custom project).

### Custom keycloak themes
It's possible to provide custom keycloak themes see [custom-project](https://github.com/openremote/custom-project/blob/main/deployment/keycloak/themes/README.md) for details.


## Setup code
Custom setup code allows for programmatic configuration of a clean installation including the provisioning of `Agents`, `Assets`, `users`, `rules`, etc. This means that the system loads in a pre-configured state that can easily be reproduced after a clean install. Setup code is executed via the `SetupService` and is only executed if the `OR_SETUP_RUN_ON_RESTART` environment variable is set to `true` or if the database that the instance uses is empty.

To write custom setup code then you need to create implementations of `SetupTasks` these are then discovered using the standard java `ServiceLoader` mechanism and must therefore be registered via `META-INF/services` mechanism, generally implementations should extend the `EmptySetupTasks` which will do basic configuration of `keycloak` which is essential, see [custom-project](https://github.com/openremote/custom-project/blob/main/setup/src/main/java/org/openremote/manager/setup/custom/CustomSetupTasks.java) for details.
