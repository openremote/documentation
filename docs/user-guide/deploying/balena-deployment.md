---
sidebar_position: 5
---

# Balena Deployment 
This README will give some basics of Balena and how to deploy an OpenRemote image to a Balena fleet.

## What is Balena / Definitions

Balena is the totality of the product. Look at [balena.io](https://balena.io).

* BalenaOS is the Operating System which runs on edge devices (Raspberry Pis, Intel NUCs, etc.). BalenaOS is able to
  run Docker containers (with a limited feature-set), and allows management by OpenBalena/BalenaCloud.
* OpenBalena is the open-source backend software that can manage fleets (groups) of devices. It can push new versions of
  images to devices, manage those devices (power management, resource management, environment variables, etc)
* BalenaCloud is (the company) Balena's SaaS product, which uses OpenBalena for their core part of the backend, like the
  device API, the image registry, etc. BalenaCloud uses part of openBalena for its backend services.

## OpenRemote and BalenaOS

:::warning

Issues with bootup could potentially corrupt migrations being performed from Keycloak or the manager, leading to
data loss. Please be aware of actions and perform backups.

:::

OpenRemote is a multi-container platform that normally requires multiple containers to start in the correct sequence to
properly start its services (Deployment, Postgres, Keycloak, Manager, Proxy).

For starters, for the manager to boot up correctly, we require to ensure that all required services (meaning the database and Keycloak) have been started properly and are operationally ready. This allows the various services to perform their own migrations/startup/become healthy before OpenRemote starts booting up.

Additional services can be added/modified as normal.

# Required tooling

We recommend going through the [balena CLI masterclass](https://docs.balena.io/learn/more/masterclasses/cli-masterclass/).

To manually manage the devices using the terminal, install ``balena-cli`` to your machine. You can use the CLI to
perform the same actions as with BalenaCloud. Specifically, you can ``push`` a new release to a device. This is what
we will use to push new versions. Make sure to ``balena login`` before proceeding.

# Development and Deployment

Balena follows a git-like deployment lifecycle, with some more features being sprinkled in over the years. Specifically,
devices or the entire fleet can track the latest release or pin to a specific release, which can be changed by the
administrator from the CLI/from the BalenaCloud dashboard.

To create a new release, you can push this directory to the fleet using the included shell file in ``balena/run_balena_build.sh``.

## Parameters:
* `--dry-run`: This flag enables the dry-run mode. When this mode is enabled, the script will build the Docker images and bring up the containers locally using docker-compose instead of pushing to the Balena fleet.
* `--skip-build`: This flag skips the build process. When enabled, the script will not remove the existing manager-build directory or rebuild the project.
* `<balena_fleet_slug>`: This is a required argument specifying the Balena fleet slug to which the application will be pushed.

## Script outline:
* Initialize Variables: The script initializes three variables: DRY_RUN (default: false), SKIP_BUILD (default: false), and BALENA_FLEET_SLUG (default: empty string).
* Parse Arguments: The script processes the provided arguments:
  *	If --dry-run is present, DRY_RUN is set to true.
  *	If --skip-build is present, SKIP_BUILD is set to true.
  *	Any other argument is assigned to BALENA_FLEET_SLUG.
  * Validate BALENA_FLEET_SLUG: The script checks if BALENA_FLEET_SLUG is set. If not, it prints the usage information and exits.
* Login to Balena: The script logs in to Balena using the `balena login` command.
* Build Process (if not skipped):
  *	If SKIP_BUILD is false, the script removes the existing manager-build directory.
  *	It navigates to the parent directory and runs the `gradlew clean installDist` command to rebuild OpenRemote from source.
  *	It then returns to the balena directory.
  * Copy New Builds: If the manager-build directory does not exist, the script copies the new build files from Gradle's build output to ./manager-build.
  * Push to Balena or Run Docker Compose:
    *	If DRY_RUN is true, the script builds the Docker images without using the cache and starts the containers locally using docker-compose with the --force-recreate option.
    *	If DRY_RUN is false, the script pushes the application to the specified Balena fleet using the balena push command with the --nocache option.

# Quirks you should be aware of

In general, Balena CLI/Balena API/BalenaCloud do things their own way. Some examples:

* You cannot set a ``docker-compose.yml`` file to be used specifically for balena, it NEEDS to use``docker-compose.yml``.
* ``balena push`` **does not** build the image locally. All folders/files referenced in the Dockerfiles/docker-compose
  files are uploaded to their own builder platform and are built on their premises. This is done to allow building
  the images in all of the different architectures that you might use the release in.
* You cannot use environment variables in the way you usually do. Using default/error values in environment variables
  do not work.
* For the above point, the concept of environment variables in a `docker-compose.yml` file doesn't quite exist;
  environment variables in Balena environments are set using the CLI or the dashboard, and there are fleet-level and
  device-level variables. You would set an environment variable in the docker-compose file specifically when it's an
  environment variable that applies for ALL devices that may run this in BalenaOS (or for debugging locally of course).
  All environment variables of a device/fleet are included in ALL services. So ``OR_MAIN_THREAD_WAIT_MS`` WILL end up on
  the proxy container, and Keycloak, and the manager, etc.
  A script to allow for environment variables of a file to be uploaded to a fleet will be added later on.

  
