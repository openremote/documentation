---
sidebar_position: 2
---

# Installing and using Docker

All OpenRemote projects are delivered as Docker images that support `linux/aarch64` and `linux/amd64`, you'll need a Docker host to run containers and service stacks.

## Local Engine

For a local engine (developer workstation setup) simply installing [Docker Desktop](https://www.docker.com/products/docker-desktop) is enough (uses WSL2 backend on Windows).

Ensure the following commands work:

```
docker -v
docker-compose -v
```

**If running Docker Toolbox Edition make sure the code you are working on is in your 'HOME' directory**, and please ensure the following command lists the output of your `HOME` directory (host volume mapping seems unreliable in versions &lt;= 19.03.01 which use VirtualBox 5.x):
```
docker run --rm -v ~:/data alpine ls -al /data
```

***If you see your `HOME` directory files listed then please skip the following steps otherwise please follow and try the above command again***

1. Open Docker Quickstart Terminal
2. Type `docker-machine rm default`
3. Download and install VirtualBox >= 6.x
4. Close and reopen the Docker Quickstart Terminal
5. Try the above `docker run` command again


Assuming all the above is working and correct then if you are using Docker Toolbox Edition (Virtual Box); please follow the following steps to add required port mappings:
 
 1. Open VirtualBox and select the `docker` VM (called `default` unless specified otherwise) then go to Settings -> Network -> Adapter 1 -> Advanced -> Port Forwarding
 2. Add the following rules:
 
 | Name | Protocol | Host IP | Host Port | Guest IP | Guest Port |
 | --- | --- | --- | --- | --- | --- |
 |postgresql|TCP||5432||5432|
 | keycloak | TCP |  | 8081 |  | 8081 |
 | map | TCP |  | 8082 |  | 8082 |
 | proxy http | TCP |  | 80 |  | 80 |
 | proxy https | TCP |  | 443 |  | 443 |


## ARM SBC (RPi, ODROID, etc.) installation steps

The following steps are relevant for an `ODROID C2` but should be similar for other SBCs (note that armbian don't support the RPi at the time of writing so use the Raspbian 64bit OS or similar), the important thing is that you have a 64bit OS which is required to use our docker images because the OpenJDK at the time of writing doesn't have a JIT compiler 32bit JDK for ARM - one is in progress though):

1. Download Armbian (https://www.armbian.com/odroid-c2/) and flash to SD card using Etcher
1. Power on and SSH into ODROID then follow Armbian prompts to change root password and Ctrl-C to skip/abort creating a new user
1. Install curl `apt-get install curl`
1. Install docker using convenience script:
   1. `curl -fsSL https://get.docker.com -o get-docker.sh`
   2. `sh get-docker.sh`
1. Check install was successful with `docker --version`
1. Install docker-compose (this is starting to be included in docker package directly now as `docker compose` check if that's the case, if not then follow the next steps):
   1. `curl -L "https://github.com/ubiquiti/docker-compose-aarch64/releases/download/1.22.0/docker-compose-Linux-aarch64" -o /usr/local/bin/docker-compose`
   1. `chmod +x /usr/local/bin/docker-compose`
1. Check install was successful with `docker compose -h` or `docker-compose --version`



## Remote Engine

### Installing a remote engine

To install a remote engine (hosted deployment), you need SSH public key access to a Linux host, and then Docker Machine can do the rest and install all required packages on the host and configure secure access:

```
docker-machine create --driver generic \
    --generic-ip-address=<HOST> \
    --generic-ssh-port=<SSH PORT> \
    <DOCKER MACHINE NAME>
```

Follow the instructions [here](https://docs.docker.com/machine/drivers/generic/).

After you let Docker Machine install the Docker daemon on the remote host, you must fix the generated Docker client credentials configuration files on your local machine.

Move `~/.docker/machine/certs/*` into `~/.docker/machine/machines/<DOCKER MACHINE NAME>/` and fix the paths in `~/.docker/machine/machines/<DOCKER MACHINE NAME>/config.json`.

When a remote engine is first installed the client credentials should be zipped and made available in a private and secure location. The client credentials can be found at `~/.docker/machine/machines/<DOCKER MACHINE NAME>/`.

### Using a remote engine

You do not need SSH access on the remote host to simply use an already installed Docker engine.

Manually copy the client credentials of the remote engine from the secure location to your local machine by unzipping the credentials into `~/.docker/machine/machines/<DOCKER MACHINE NAME>/` and then you will need to fix the paths in `~/.docker/machine/machines/<DOCKER MACHINE NAME>/config.json`.

***For Windows you will have to use escaped backslashes e.g. `C:\\Users\Me\\.docker\\machine\\`.***

Once the remote engine is installed ensure that `docker-machine ls` shows the new engine and that the State is `Running`:

```
docker-machine ls
eval $(docker-machine env or-host123)
docker ps
```

This will show running containers on Docker Machine `or-host123`.

## Using Docker Compose

Our services are configured as a stack of containers with Docker Compose.

Service images will be built automatically when they do not exist in the Docker engine image cache or when the `Dockerfile` for the service changes. **Docker Compose does not track changes to the files used in a service so when code changes are made you will need to manually force a build of the service**.

Here are a few useful Docker Compose commands:

* `docker-compose -f <PROFILE> pull <SERVICE> <SERVICE>...` - Force pull requested services from Docker Hub, if no services specified then all services will be pulled (e.g. docker-compose -f profile/manager.yml pull to pull all services)

* `docker-compose -f <PROFILE> build <SERVICE> <SERVICE>...` - Build/Rebuild requested services, if no services specified then all services will be built

* `docker-compose -f <PROFILE> up <SERVICE> <SERVICE>...` - Creates and starts requested services, if no services specified then all services will be created and started (also auto attaches to console output from each service use `-d` to not attach to the console output)

* `docker-compose -f <PROFILE> up --build <SERVICE> <SERVICE>...` - Creates and starts requested services but also forces building the services first (useful if the source code has changed as docker-compose will not be aware of this change and you would otherwise end up deploying 'stale' services)

* `docker-compose -f <PROFILE> down <SERVICE> <SERVICE>...` - Stops and removes requested services, if no services specified then all services will be stopped and removed. Sometimes the shutdown doesn't work properly and you have to run `down` again to completely remove all containers and networks.

When deploying profiles you can provide a project name to prefix the container names (by default Docker Compose will use the configuration profile's folder name); the project name can be specified with the -p argument using the CLI:

```
docker-compose -p <your_project_name> -f <profile> -f <profile_override> up -d <service1> <service2> ...
```

<!--
## VirtualBox Engine
you can install a virtual machine as follows:

- Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
- Install [Vagrant](https://developer.hashicorp.com/vagrant/install)
- Install [Docker Toolbox](https://www.docker.com/products/overview#/docker_toolbox)
- Check out the [OpenRemote project](https://github.com/openremote/openremote) and change to `$PROJECT_DIRECTORY/platform/`
- Execute `vagrant up` to start a virtual machine

Configure the virtual machine as a Docker host machine with:
```
docker-machine create \
  -d generic \
  --generic-ssh-user=$(vagrant ssh-config | grep ' User ' | cut -d ' ' -f 4) \
  --generic-ssh-key=$(vagrant ssh-config | grep IdentityFile | cut -d ' ' -f 4) \
  --generic-ip-address=$(vagrant ssh-config | grep HostName | cut -d ' ' -f 4) \
  --generic-ssh-port=$(vagrant ssh-config | grep Port | cut -d ' ' -f 4) \
  openremote
```

Check your Docker host machines with `docker-machine ls`.

To prepare your shell environment (variables), run `eval $(docker-machine env openremote)`. Now  execute `docker [version|images|ps|...]` to interact with your Docker host. You can login directly on your Docker host machine with `vagrant ssh`.
-->

## Building images

Run the following command to build the images with the proper tags:
```
DATE_TAG=<some_date> docker-compose -f profile/deploy.yml build

or

DATE_TAG=<some_date> docker-compose -p my_custom_project \
 -f profile/production.yml \
 build
```
When the environment variable `DATE_TAG` is omitted, then the tag `latest` is used for the image. You should consider exporting the variable before executing multiple commands in a shell.

## Labelling images

To make it easy to track which version of the code was used to build the images,  the `GIT_COMMIT` label should be supplied when executing the docker compose build command e.g.:
```
docker-compose -f profile/deploy.yml build --build-arg GIT_COMMIT=<commitSHA1>

or

docker-compose -p my_custom_project \
 -f profile/production.yml \
 build --build-arg GIT_COMMIT=<commitSHA1>
```
This information can then be viewed using the `docker inspect` command:
```
docker inspect <IMAGE_NAME>
```
Or to just output the GIT_COMMIT value:
```
docker inspect -f '{{index .ContainerConfig.Labels "git-commit"}}' <IMAGE_NAME>
```
For this to work the following lines must be included in the `Dockerfile` of each image:
```
ARG GIT_COMMIT=unknown
LABEL git-commit=$GIT_COMMIT
```

## Publishing images
Push images to [Docker Hub](https://hub.docker.com/u/openremote):

```
docker login

docker push openremote/proxy:latest
docker push openremote/postgresql:latest
docker push openremote/keycloak:latest
docker push openremote/manager:latest
docker push openremote/tileserver-gl:latest
docker push openremote/deployment:latest

or

docker push openremote/proxy:$DATE_TAG
docker push openremote/postgresql:$DATE_TAG
docker push openremote/keycloak:$DATE_TAG
docker push openremote/manager:$DATE_TAG
docker push openremote/tileserver-gl:$DATE_TAG
docker push openremote/deployment:$DATE_TAG

```

## Exporting and importing images
The docker images created from the docker-compose files can be exported and sent to another machine to import them.

## Buildx (Cross platform build tool)
Buildx allows cross platform image compilation (i.e. build ARM64 image on an AMD64 machine):

* Create buildx instance (if not already done) - `docker buildx create --name builder`
* Select buildx instance - `docker buildx use builder`

To build for example the manager image:

`docker buildx build --load --platform linux/arm64 -t openremote/manager:latest openremote/manager/build/install/manager/`
