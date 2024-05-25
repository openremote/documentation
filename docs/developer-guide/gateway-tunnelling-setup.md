---
sidebar_position: 16
---

# Gateway tunnelling setup

This guide describes the steps necessary to setup the gateway tunnelling functionality which allows remote access to edge gateways using [SISH](https://github.com/antoniomika/sish)

## Edge Instance Setup

### SSH keys
* `mkdir -p deployment/sish/pubkeys deployment/sish/client deployment/sish/keys`
* `ssh-keygen -t ed25519 -b 4096` -f client
* `mv client.pub deployment/sish/pubkeys`
* `mv client deployment/sish/client` (this will be needed by the edge instances) - Optionally encrypt this file using gradle task
* `ssh-keygen -t ed25519 -b 4096` -f server_key
* `mv server_key deployment/sish/keys`

### Docker envrionment variables
* Set keycloak container environment variables:
  * `KEYCLOAK_ISSUER_BASE_URI: https://${OR_HOSTNAME}/auth`
  * `KC_HOSTNAME:` This must be blank or completely removed (i.e. do not set this environment variable)
  * `KC_HOSTNAME_STRICT: false`
* Set manager environment variables:
  * `OR_WEBSERVER_ALLOWED_ORIGINS: *`
  * `OR_GATEWAY_TUNNEL_SSH_KEY_FILE=<PATH_TO_PUBLIC_SISH_KEY>` (/deployment/sish/client/cert)


## Central Instance Setup
* Set AWS_ROUTE53_ROLE on proxy container (this can be left as empty string to inherit from AWS EC2 instance provided the instance is using a cloudformation template that sets this value in `/etc/environment`)
* Set `DOMAINNAMES` to include wildcard certificate e.g. `*.example.openremote.app`
* Add wildcard DNS A/AAAA record(s) e.g. `*.example.openremote.app`
* Uncomment/add sish service in docker compose profile
* Set `SISH_HOST` and `SISH_PORT` on proxy container
* Set TCP port range in sish service (to allow raw TCP tunnelling)
* Allow inbound access to port `2222` and to the TCP port range exposed on the instance
* Generate or select existing SSH private key and add this to the deployment image and set SISH variable: `--private-keys-directory`

