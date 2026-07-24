---
sidebar_position: 5
---

# Kubernetes

In addition to being deployed with docker compose, the containers making up an OpenRemote stack can also be deployed under kubernetes.

To make the deployment as easy as possible, we provide Helm charts.  
You can find them, as well as all the required files, in the [openremote](https://github.com/openremote/openremote) repository,
under the [kubernetes](https://github.com/openremote/openremote/tree/master/kubernetes) folder.  
The folder also includes a [README.md](https://github.com/openremote/openremote/tree/master/kubernetes/README.md) file with detailed information on configuration and deployment.

At this stage, the helm charts are not published in an OCI registry.

## TL;DR

The following steps deploy all the required components to run OpenRemote on your local cluster.  
It assumes that you have kubectl and helm installed on your machine.  

### Create the Persistent Volumes and the required secrets

This is performed via the `or-setup` helm chart.
Review the `values.yaml` file under the `or-setup` folder and create one with values appropriate for your environment.

You should certainly edit the `basePath` value to point to a folder on your local machine.  
Under macOS, it needs to be located under your home folder (/Users/xxx/...).

The `openremote-secrets.yaml` file under `or-setup/templates` creates a secret to hold sensitive configuration from OpenRemote
(database username and password, Keycloak admin password).  
The values in this file are the default ones, update as required.

```bash
helm install or-setup or-setup -f your_values.yaml
```

### Install the charts

Install the different charts in order
```bash
helm install proxy proxy
helm install postgresql postgresql
helm install keycloak keycloak
helm install manager manager
```

If running under linux, you must enable the requiresPermissionsFix flag when installing postgresql
```bash
helm install postgresql postgresql --set requiresPermissionsFix=true
```

