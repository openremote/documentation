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
* The proxy development profile needs to be running to provide the correctly setup proxying functionality, with the correctly configured environment variables

You need to setup the SSH keys as described in the "Edge Instance Setup" section above.

For the **central instance** profile:

Run the main `docker-compose.yml` file with `OR_HOSTNAME=localhost`, and add the following:
* In the proxy service:
  * SISH_PORT: 8090
  * SISH_HOST: sish
* In the manager service:
  * Remove the manager port exports for metrics etc., and add ``8008:8008`` to allow attaching the debugger from the IDE
  * Optionally, set the manager to be built from context ``./manager/build/install/manager``, so that code changes are reflected during Docker image rebuild (after running `./gradlew clean installDist`)
  * Add `OR_JAVA_OPTS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8008"` to allow remote debugging from the IDE
  * `OR_METRICS_ENABLED: false`
  * `OR_GATEWAY_TUNNEL_SSH_HOSTNAME: "localhost"`
  * `OR_GATEWAY_TUNNEL_SSH_PORT: 2222`
  * `OR_GATEWAY_TUNNEL_TCP_START: 9000`
  * `OR_GATEWAY_TUNNEL_HOSTNAME: "localhost"`
  * `OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: 2`
* Add the ``sish`` service, as found in `deploy.yml`, and modify:
  * Add volume ``./deployment:/deployment`` so that you can map the SSH keys as instructed above

For the **proxy development profile**:

* Modify the proxy service:
  * Instead of extending from `deploy.yml`, instead use the default proxy image:
    * `image: openremote/proxy:latest`
  * Set the ports of the proxy service, so that they dont clash with the central instance's proxy ports:
  * `- "444:443"`
  * `- "808:80"`
  * Set the sish environment variables:
    * `SISH_HOST: sish`
    * `SISH_PORT: 8090`

The above setup should make the **`org.openremote.test.gateway.GatewayTest#Gateway Tunneling Edge Gateway Integration test`** pass when run from the IDE or via Gradle.


Here's a Git diff you can apply to your local `docker-compose.central.yml` and `docker-compose.proxy.dev.yml` files to get the above setup:


<details>
  <summary>Click to see the patch</summary>

```diff
Index: profile/dev-proxy.yml
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/profile/dev-proxy.yml b/profile/dev-proxy.yml
--- a/profile/dev-proxy.yml	(revision 2b8c46b824dd3a48657fd71defd6699dac65b98e)
+++ b/profile/dev-proxy.yml	(date 1760799651300)
@@ -16,9 +16,16 @@
 services:
 
   proxy:
-    extends:
-      file: deploy.yml
-      service: proxy
+#    extends:
+#      file: deploy.yml
+#      service: proxy
+    image: openremote/proxy:latest
+    depends_on:
+      keycloak:
+        condition: service_healthy
+    ports:
+      - "444:443"
+      - "808:80"
     environment:
       MANAGER_HOST: 'host.docker.internal'
       # Uncomment to use sish in development
Index: docker-compose.yml
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/docker-compose.yml b/docker-compose.yml
--- a/docker-compose.yml	(revision 2b8c46b824dd3a48657fd71defd6699dac65b98e)
+++ b/docker-compose.yml	(date 1760798570417)
@@ -33,7 +33,8 @@
       DOMAINNAMES: ${OR_ADDITIONAL_HOSTNAMES:-}
       # USE A CUSTOM PROXY CONFIG - COPY FROM https://raw.githubusercontent.com/openremote/proxy/main/haproxy.cfg
       #HAPROXY_CONFIG: '/data/proxy/haproxy.cfg'
-
+      SISH_PORT: 8090
+      SISH_HOST: sish
   postgresql:
     restart: always
     image: openremote/postgresql:${POSTGRESQL_VERSION:-latest}
@@ -57,16 +58,19 @@
 
 
   manager:
-#    privileged: true
+    #    privileged: true
     restart: always
     image: openremote/manager:${MANAGER_VERSION:-latest}
+#    build:
+#      context: ./manager/build/install/manager
     depends_on:
       keycloak:
         condition: service_healthy
     ports:
-      - "127.0.0.1:8405:8405" # Localhost metrics access
-      - "${PRIVATE_IP:-127.0.0.1}:8405:8405" # Allows to also expose metrics on a given IP address,
+#      - "127.0.0.1:8405:8405" # Localhost metrics access
+#      - "${PRIVATE_IP:-127.0.0.1}:8405:8405" # Allows to also expose metrics on a given IP address,
                                              # intended to be IP of the interface of the private subnet of the EC2 VM
+      - "8008:8008"
     environment:
       OR_SETUP_TYPE:
       OR_ADMIN_PASSWORD:
@@ -77,11 +81,19 @@
       OR_EMAIL_X_HEADERS:
       OR_EMAIL_FROM:
       OR_EMAIL_ADMIN:
-      OR_METRICS_ENABLED: ${OR_METRICS_ENABLED:-true}
+      OR_METRICS_ENABLED: ${OR_METRICS_ENABLED:-false}
       OR_HOSTNAME: ${OR_HOSTNAME:-localhost}
       OR_ADDITIONAL_HOSTNAMES:
       OR_SSL_PORT: ${OR_SSL_PORT:--1}
       OR_DEV_MODE: ${OR_DEV_MODE:-false}
+      OR_JAVA_OPTS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8008"
+
+
+      OR_GATEWAY_TUNNEL_SSH_HOSTNAME: "localhost"
+      OR_GATEWAY_TUNNEL_SSH_PORT: 2222
+      OR_GATEWAY_TUNNEL_TCP_START: 9000
+      OR_GATEWAY_TUNNEL_HOSTNAME: "localhost"
+      OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: 2
 
       # The following variables will configure the demo
       OR_FORECAST_SOLAR_API_KEY:
@@ -90,3 +102,10 @@
       OR_SETUP_IMPORT_DEMO_AGENT_VELBUS:
     volumes:
       - manager-data:/storage
+
+  sish:
+    extends:
+      file: profile/deploy.yml
+      service: sish
+    volumes:
+      - ./deployment:/deployment
```

</details>