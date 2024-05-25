---
sidebar_position: 4
---

# Building and testing

## Building

Ensure you have prepared your environment as described [here](preparing-the-environment.md).

Our build tooling is `gradle` and building the code is just a matter of executing the following gradle tasks:

```
./gradlew clean installDist
```

## Testing

Our test suite is mostly integration tests and they require the `keycloak` and `postgres` services to be running on `localhost`, you can start these using the `/profile/dev-testing.yml` docker compose profile.

If you want to run the tests, execute:

```
./gradlew test
```
