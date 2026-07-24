---
sidebar_position: 00
---

# Preparing the environment

To build OpenRemote projects, you have to first prepare the environment on your developer workstation or build machine. Alternatively you can use a [Docker image with tooling](#runtime-tooling).

Ensure you have installed and configured the following tools:

## Runtime tooling
OpenRemote is primarily packaged as Docker images and deployed using docker compose, you will need a docker compatible runtime:
* [Docker](https://docs.docker.com/engine/install/)
* [Docker compose](https://docs.docker.com/compose/install/)

Ensure the following commands execute successfully:

```shell
docker -v
docker-compose -v
```

## Development tooling
For development you need the following in addition to the runtime tooling:

* Java 21 JDK ([OpenJDK](https://openjdk.java.net/), [Oracle Java SE JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html))
* [Git](https://git-scm.com/downloads)
* [Git LFS](https://git-lfs.com/) `git lfs install`
* [NodeJS](https://nodejs.org/en/download/current/) (>=20.0, on macOS you can use [Homebrew](https://brew.sh/) and `brew install node@20`)
* [yarn](https://yarnpkg.com/getting-started/install) `corepack enable; yarn init -2` (>=3.2.0)

Ensure the following commands execute successfully:

```shell
java -version
git --version
node -v
yarn -v
```

Ensure that you have the `JAVA_HOME` environment variable set to the path of JDK.

## See also

- [Next 'Get Started' step: Build the code and run the manager](https://github.com/openremote/openremote/blob/master/README.md)
- [Get Started](https://openremote.io/get-started-iot-platform/)
