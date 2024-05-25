---
sidebar_position: 7
---

# Docker compose profiles

## Docker services
The following services are used by the main OpenRemote code base:

* proxy - Reverse SSL proxy (HAProxy) for the web services with auto SSL certificate generation (letsencrypt)
* manager - Runs the OpenRemote Manager (by default depends on postgresql and keycloak)
* postgresql - PostgreSQL DB
* keycloak - Keycloak identity provider service
* map - tileserver-gl service that is used for serving raster map tiles (only needed for UI components/apps that use mapbox-js)

## Docker compose profiles
Docker compose profiles (Docker Compose `.yml` files) are used to configure and start required services; the standard profiles are located in the profile folder of the main [OpenRemote repository](https://github.com/openremote/openremote/tree/master/profile) although the `demo` profile is in the root of the repo.

The standard profiles are:

### Deploy (deploy.yml)
This is the main profile which all other profiles extend; it can't be used directly.

### Demo (../docker-compose.yml)
This is a demo profile which starts all services and provides a quick start for getting a running local deployment.

#### Prerequisites
Docker images must have been pulled from Docker Hub:
```
docker-compose pull
```

Or the docker images must have been built locally (requires the full stack be built):
```
./gradlew clean installDist
docker-compose build
```

To start the containers:
```
docker-compose up -d
```

### UI Development (dev-ui.yml)
This is for doing development work on the UI without having to run the manager in an IDE.

#### Prerequisites
Docker images must have been pulled from Docker Hub:
```
docker-compose -f profile/dev-ui.yml pull
```

Or the docker images must have been built locally (requires the full stack be built):
```
./gradlew clean installDist
docker-compose -f profile/dev-ui.yml build
```

To start the containers:
```
docker-compose -f profile/dev-ui.yml up -d
```

#### Exposed Services
* Manager: http://localhost:8080
* Keycloak: http://localhost:8081
* PostgreSQL DB: jdbc:postgresql://localhost:5432/openremote

### Full Stack Development / Running Tests (dev-testing.yml)
This is for running tests or doing development work on the Manager (in an IDE), see the [Setting up an IDE](setting-up-an-ide.md) guide for running the Manager in an IDE.

#### Exposed Services
* Keycloak: http://localhost:8081/auth
* PostgreSQL DB: jdbc:postgresql://localhost:5432/openremote

### Full Stack Development with HTTPS Proxy (dev-proxy.yml)
This is the same as the Full Stack Development profile but also adds the proxy service to allow development/testing of the Manager running behind the reverse proxy with HTTPS (so development environment matches final deployment configuration).

To use this proxy correctly you will need to set the correct environment variables for the manager running behind SSL proxy as described in [Setting up an IDE](setting-up-an-ide.md).

#### Exposed Services
* Manager: https://localhost
* Keycloak: http://localhost:8081/auth
* PostgreSQL DB: jdbc:postgresql://localhost:5432/openremote

### Map (dev-map.yml)
This is used for starting the map service and is required when working on raster map components/apps.

#### Exposed Services
* Tileserver-gl: http://localhost:8082
