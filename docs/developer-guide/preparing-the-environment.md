---
sidebar_position: 1
---

# Preparing the environment

To build OpenRemote projects, you have to first prepare the environment on your developer workstation or build machine. Alternatively you can use a [docker image with tooling](#runtime-tooling).

Ensure you have installed and configured the following tools:

## Runtime tooling
To run docker images from Docker Hub you need to install the following tooling:
* Docker see [here](installing-and-using-docker.md#local-engine)

If you want to manage remote docker engines then you will also need to install `docker-machine` separately (since docker 2.2.x):

* [Docker machine](https://docs.docker.com/machine/install-machine/)

Ensure the following commands execute successfully:

```
docker ps
docker-compose version
```

If you installed docker machine  then make sure the following command executes successfully:

`docker-machine version`

## Development tooling
For development you need the following in addition to the runtime tooling:

* Java 17 JDK ([OpenJDK](https://openjdk.java.net/), [Oracle Java SE JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html))
* [GIT](https://git-scm.com/downloads)
* [NodeJS](https://nodejs.org/en/download/current/) (>=18.12.0, on MacOS you can use [Homebrew](https://brew.sh/) and `brew install node@18`)
* [yarn](https://yarnpkg.com/getting-started/install) `corepack enable; yarn init -2` (>=3.2.0)

Ensure the following commands execute successfully:

```
java -version
git --version
node -v
yarn -v
```

Ensure that you have the `JAVA_HOME` environment variable set to the path of JDK.

## See also

- [Installing and using Docker](installing-and-using-docker.md)
- [Next 'Get Started' step: Build the code and run the manager](https://github.com/openremote/openremote/blob/master/README.md)
- [Get Started](https://openremote.io/get-started-iot-platform/)
