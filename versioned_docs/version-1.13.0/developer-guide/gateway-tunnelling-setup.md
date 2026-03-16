---
sidebar_position: 16
---

# Gateway tunnelling setup

This guide describes the steps necessary to setup the gateway tunnelling functionality which allows remote access to edge gateways using [SISH](https://github.com/antoniomika/sish)

## Edge Instance Setup

### SSH keys

* `mkdir -p deployment/sish/pubkeys deployment/sish/client deployment/sish/keys`
* `ssh-keygen -t ed25519 -b 4096 -f client`
* `mv client.pub deployment/sish/pubkeys`
* `mv client deployment/sish/client` (this will be needed by the edge instances) - Optionally encrypt this file using gradle task
* `ssh-keygen -t ed25519 -b 4096 -f server_key`
* `mv server_key deployment/sish/keys`

### Docker envrionment variables

* Set Keycloak container environment variables:
  * `KEYCLOAK_ISSUER_BASE_URI: https://${OR_HOSTNAME}/auth`
  * `KC_HOSTNAME:` This must be blank or completely removed (i.e. do not set this environment variable)
  * `KC_HOSTNAME_STRICT: false`
* Set manager environment variables:
  * `OR_WEBSERVER_ALLOWED_ORIGINS: *`
  * `OR_GATEWAY_TUNNEL_SSH_KEY_FILE: <PATH_TO_PUBLIC_SISH_KEY>` (/deployment/sish/client/cert)
  * `OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: <MINUTES>` This optional variable can be set to automatically close tunnels after the specified number of minutes. When it is set to 0 (or not set) tunnels remain open until they are manually closed.

## Central Instance Setup

* Proxy container must be able to read/write Route53 DNS TXT record (see https://certbot-dns-route53.readthedocs.io/), this requires the instance to have the required permissions to the Route53 account where the DNS zone is hosted, if the hosted zone is in the same account as the EC2 instance then the standard `ec2-access` IAM profile that is attached to all our EC2 instances already contains the required permissions so no action is needed, alternatively if the hosted zone is in a different account to the EC2 instance then it is important that the EC2 instance cloudformation template parameter `DNSHostedZoneRoleArn` was correctly set, this will then get set as `AWS_ROUTE53_ROLE` in `/etc/environment` and the proxy container will output this to `~/.aws/config` during startup which will allow the plugin to assume that role for Route53 calls. The `AWS_ROUTE53_ROLE` can alternatively be defined via env file or within the docker compose file itself (NOTE: this role must be assumable by the `ec2-access` policy)
* Set `DOMAINNAMES` to include wildcard certificate e.g. `*.example.openremote.app`
* Add wildcard DNS A/AAAA record(s) e.g. `*.example.openremote.app`
* Uncomment/add sish service in Docker Compose profile
* Set `SISH_HOST` and `SISH_PORT` on proxy container
* Set `OR_GATEWAY_TUNNEL*` environment variables on manager container
* Set TCP port range in sish service (to allow raw TCP tunnelling)
* Allow inbound access to port `2222` and to the TCP port range exposed on the instance
* Generate or select existing SSH private key and add this to the deployment image and set SISH variable: `--private-keys-directory`

# Gateway Tunnelling Development Setup

To run the manager locally as an edge gateway, to test the gateway tunnelling functionality, two different docker compose profiles need to be running:
* The central instance profile (e.g. `docker-compose.central.yml`) needs to be running to provide the sish server functionality, with the correctly configured environment variables
* The testing (unproxied) development profile needs to be running to allow the manager to run properly in the IDE.

You need to setup the SSH keys as described in the "Edge Instance Setup" section above.

For the **central instance** profile:

Run the main `docker-compose.yml` file with `OR_HOSTNAME=localhost`, and add the following:
* In the proxy service:
  * SISH_PORT: 8090
  * SISH_HOST: sish
* In the manager service:
  * Add `8008:8008` to allow attaching the debugger from the IDE
  * Optionally, set the manager to be built from context `./manager/build/install/manager`, so that code changes are reflected during Docker image rebuild (after running `./gradlew clean installDist`)
  * Add `OR_JAVA_OPTS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8008"` to allow remote debugging from the IDE
  * `OR_METRICS_ENABLED: false`
  * `OR_GATEWAY_TUNNEL_SSH_HOSTNAME: "localhost"`
  * `OR_GATEWAY_TUNNEL_SSH_PORT: 2222`
  * `OR_GATEWAY_TUNNEL_TCP_START: 9000`
  * `OR_GATEWAY_TUNNEL_HOSTNAME: "localhost"`
  * `OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: 2`
* Add the `sish` service, as found in `deploy.yml`, and modify:
  * Add volume `./deployment:/deployment` so that you can map the SSH keys that were generated above

The routing of requests from the central instance to the gateway looks like this: Central Instance --> Sish --> Gateway Proxy --> Keycloak/Manager

For the "Sish --> Gateway Proxy" requests to be routed correctly, we need to edit the local `/etc/hosts` file to route the `<tunnelID>.<tunnelSSHHost>` to localhost, like this:
```
127.0.0.1       gw-5fj1sxvwwfp7wvgqgve91n.localhost
```
The above setup should make the **`org.openremote.test.gateway.GatewayTest#Gateway Tunnelling Edge Gateway Integration test`** pass when run from the IDE or via Gradle.