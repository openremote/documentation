# OpenRemote Documentation

[![GitHub Actions Status](https://github.com/openremote/documentation/actions/workflows/ci_cd.yml/badge.svg?branch=main)](https://github.com/openremote/documentation/actions/workflows/ci_cd.yml)

This repository contains the OpenRemote documentation hosted on https://docs.openremote.io/ as Markdown files in the [docs directory](docs).

The documentation website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.
The OpenAPI documentation is generated using the [Docusaurus OpenAPI Docs](https://docusaurus-openapi.tryingpan.dev/) plug-in.

### Installation

```shell
$ yarn
```

### Local Development

```shell
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```shell
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

When the static content has been generated it can be tested using:

```shell
$ yarn serve
```

### OpenAPI Documentation

To update the OpenAPI Documentation do the following:

1. Update the `api/openapi.yaml` specification.  
   It can be downloaded from a running OpenRemote instance, e.g.:  
   `wget -O api/openapi.yaml http://localhost:8080/api/master/openapi.yaml`
2. Replace the server URL in `api/openapi.yaml` from `/api/{realm}` to `https://demo.openremote.io/api/{realm}`, e.g.:  
   `sed -i 's#/api/{realm}/#https://demo.openremote.io/api/{realm}/#g' api/openapi.yaml`
3. Remove the previously generated OpenAPI documentation using:  
   `yarn clean-api-docs all`
4. Regenerate the OpenAPI documentation using:  
   `yarn gen-api-docs all`

### Deployment

The deployment is done automatically by a GitHub Actions workflow when commits are pushed to the "main" branch.

It can also be done manually using the "deploy" command.

Using SSH:

```shell
$ USE_SSH=true yarn deploy
```

Not using SSH:

```shell
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
