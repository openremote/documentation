# Release Management

Software releases are created to be able to run OpenRemote in a reproducible and controlled manner.
All the OpenRemote code is open-source and available on GitHub in repositories in the [OpenRemote](https://github.com/openremote/) organization.

## Manager

The Manager UI and backend is versioned in the [openremote/openremote](https://github.com/openremote/openremote) repository on GitHub. 
The code in this repository is used for building the [openremote/manager](https://hub.docker.com/r/openremote/manager) Docker image which is available on Docker Hub.
You can find the release notes of each version on the [Releases](https://github.com/openremote/openremote/releases) page on GitHub.

When using the `openremote/manager` Docker image in production, it is recommended to always use a version tag (e.g. 1.2.0) so you know exactly what version is deployed.

Besides the version tags you can also use the "latest" and "develop" tags which are convenient during testing:

* **latest**: this tag is updated to always contain the most recent release.
* **develop**: this tag is used during development for testing changes before an actual release is created. A new "develop" image is built for every commit pushed to the "master" branch. It is not recommended to use this tag in production because it can be unstable.

## Custom Projects

When using a [custom deployment](custom-deployment.md) you need to specify what OpenRemote version it customizes.

A custom project always depends on the following versioned OpenRemote Manager artifacts:

* Docker images (published to [Docker Hub](https://hub.docker.com/u/openremote))
* Java code (packaged as JARs, published to [Maven Central](https://search.maven.org/search?q=g:io.openremote))
* TypeScript code (packaged as NPMs, published to [npmjs.com](https://www.npmjs.com/settings/openremote/packages))

All these artifacts share the same version number as they are all created by the [openremote/openremote](https://github.com/openremote/openremote) repository.

### Updating to new a release

When updating a custom project to a new OpenRemote release, you can follow the steps below:

1. Read the [release notes](https://github.com/openremote/openremote/releases) to get familiar with the changes
2. Update the code to use the new version:
   1. Docker images: Update the `openremote/manager` image tag in the `docker-compose.yml` file (or environment variable)
   2. Java code: Update the `openremoteVersion` in the `gradle.properties` file
   3. TypeScript code: Update the openremote package dependencies, e.g. using `yarn up -E "@openremote/*@^1.2.0"`
3. Check that the code in your custom project still builds correctly using: `./gradlew clean installDist`

### Using snapshot artifacts

If you want to use changes before they are released, it is also possible to use development snapshot artifacts in your custom projects instead.
E.g. if the next version will be 1.3.0 use the following versions:

1. Docker images: Update the `openremote/manager` image tag to `develop` in the `docker-compose.yml` file (or environment variable)
2. Java code: Update the `openremoteVersion` to `1.3.0-SNAPSHOT` in the `gradle.properties` file (requires the Maven repository https://s01.oss.sonatype.org/content/repositories/snapshots to be added to your `project.gradle` file)
3. TypeScript code: Update the openremote package dependencies using `yarn up -E "@openremote/*@^1.3.0-snapshot"`

### Using ORLib

Optionally you can also add a custom Android or iOS App using the [mobile consoles](../../developer-guide/working-on-the-mobile-consoles.md) to your custom project.
For this you can use the ORLib library which simplifies integrating OpenRemote into your App.
ORLib has its own release cycle because it is maintained in separate repositories and is only released when there are changes.

The Android ORLib is maintained in the [console-android](https://github.com/openremote/console-android) repository and published as a JAR to [Maven Central](https://search.maven.org/artifact/io.openremote/orlib).
The iOS ORLib is maintained in the [console-ios](https://github.com/openremote/console-ios) repository and published as a CocoaPod to [Trunk](https://cocoapods.org/pods/orlib).

You can find the release notes for ORLib versions on the "Releases" page of the respective GitHub repositories.

### Migration from submodules to versioned artifacts

Previously Git submodules were used in custom projects for versioning.
This has been replaced with dependencies of versioned artifacts.
Using submodules for versioning is no longer supported.

If you have an exising custom project using submodules, the easiest way to apply all the changes is to create a new custom project using the [template](https://github.com/openremote/custom-project) and add your customizations to it.

Another way to migrate an existing project is to manually apply all changes of the [commit](https://github.com/openremote/custom-project/commit/6f4870c3ae81c7eb00c5b283afe0240790e8b1e6) used for migrating the custom project template.

As you can see in the commit the manual migration steps are:

1. Remove the Git submodule(s) (`.gitmodules`) and each submodule directory (e.g. `openremote`)
2. Add dependencies to the new artifacts in your build.gradle and package.json files
3. Add the new "model" and "rest" UI component module code
4. Update the TypeScript code so classes are loaded from the new modules:
   1. Add `import rest from "rest";` to your imports if necessary
   2. Replace `import ... from '@openremote/model';` with `import ... from 'model';` if necessary
   3. Replace `manager.rest.api` with `rest.api` where applicable

If you have additional questions regarding this migration, we encourage you to reach out to our [forum](https://forum.openremote.io/).

## Local development practices

### Local artifacts

When developing a custom project you may also need to test changes you make to the manager code before your code gets merged.
You can test your local changes in a custom project by first publishing them to the local Maven repository using:

`./gradlew clean installDist publishToMavenLocal`

Note that the custom project build first resolves artifacts from `mavenLocal()` which is defined in the `project.gradle` file.
So once you publish snapshot artifacts to your local Maven repository these will no longer be downloaded from the https://s01.oss.sonatype.org/content/repositories/snapshots repository.
To undo this, either comment the `mavenLocal()` repository or remove your local artifacts in `~/.m2/repository/io/openremote`.

### Version resolution

The manager build version is resolved based on tags and commits of the Git repository using the Gradle [axion-release-plugin](https://axion-release-plugin.readthedocs.io/en/latest/).
For this to work correctly it is important your local Git repository has all published tags (i.e. use `git pull --tags`).

You can also configure Git to always fetch tags using:

* Per repository: `git config remote.origin.tagOpt --tags`
* Globally: `git config --global fetch.tagOpt --tags`

## Creating releases

The OpenRemote Manager and Android/iOS Console projects are released using a GitHub Actions "Release" workflow (release.yml).

When the release workflow is started it will:

1. Create a tag for the release
2. Create a release with release notes
3. Trigger a CI/CD build to publish all the release artifacts (i.e. Docker images, JARs, NPMs, CocoaPods)

Most of the release process is now automated but after a release some versions still need to be manually updated:

* openremote/openremote: The "version" in the `package.json` files of all modules in the 'ui' directory
* openremote/console-ios: The CocoaPod "version" in the `ORLib/ORLib.podspec` file
