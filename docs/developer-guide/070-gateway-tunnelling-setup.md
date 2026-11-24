# Gateway tunneling setup

Gateway tunnels let you access the Manager UI or another service reachable from an edge gateway.
The edge Manager opens an outbound SSH connection to [sish](https://github.com/antoniomika/sish) on the central instance when you start a tunnel.
For web tunnels, the central HAProxy terminates browser TLS and forwards requests for `gw-*` hostnames to sish, which sends them through the SSH connection to the target.
The edge gateway needs no public inbound port.

Before you begin, set up the [edge gateway connection](../user-guide/080-gateways-and-devices/10-edge-gateway.md) and confirm that the gateway is connected to the central instance.
The gateway uses that connection to receive requests to open and close tunnels.
This guide uses `central.example.com` for both the central Manager and the sish SSH endpoint. The edge must be able to reach both services.

## SSH keys

Generate a client key pair for the edge gateway and a separate host key for sish.
Run these commands in a secure working directory.

```shell
mkdir -p deployment/sish/client deployment/sish/pubkeys deployment/sish/keys
ssh-keygen -t ed25519 -N '' -f deployment/sish/client/client
mv deployment/sish/client/client.pub deployment/sish/pubkeys/
ssh-keygen -t ed25519 -N '' -f deployment/sish/keys/server_key
```

| File                                 | Where to deploy it                               |
| ------------------------------------ | ------------------------------------------------ |
| `deployment/sish/client/client`      | Edge Manager at `/deployment/sish/client/client` |
| `deployment/sish/pubkeys/client.pub` | sish at `/deployment/sish/pubkeys/client.pub`    |
| `deployment/sish/keys/server_key`    | sish at `/deployment/sish/keys/server_key`       |

Make the private keys readable by their respective services and keep them out of source control.
The edge Manager loads its key without a passphrase prompt. It currently accepts the sish server's SSH host key without checking it against a known host key.
For multiple gateways, you can give each gateway its own key and a uniquely named public key file in the central sish authentication directory.
You can reuse an existing sish host key by placing it in `deployment/sish/keys/`.
If your custom project uses Gradle file encryption to store deployment secrets, add the client key to `gradleFileEncrypt` and run `./gradlew encryptFiles` with `GFE_PASSWORD` set.
Keep the plaintext key out of Git and deploy the decrypted key to the edge Manager.

## Central instance setup

### DNS, TLS, and firewall

1. Add a wildcard DNS record for `*.central.example.com` pointing to the central proxy.
   Use an A record for IPv4 and an AAAA record if the proxy is reachable over IPv6.
2. Give the central proxy a TLS certificate covering `*.central.example.com`.
   The central Manager hostname `central.example.com` also needs to be covered.
   - To have the OpenRemote proxy request the wildcard certificate, add `*.central.example.com` to its `DOMAINNAMES` list.
     The standard deployment profile passes `OR_ADDITIONAL_HOSTNAMES` into this setting.
     The proxy uses the [Certbot Route 53 plugin](https://certbot-dns-route53.readthedocs.io/en/stable/) for wildcard DNS validation and needs [Route 53 permissions](https://certbot-dns-route53.readthedocs.io/en/stable/#credentials) to manage the challenge TXT records.
     For a hosted zone in the same account as the EC2 instance, the instance role can supply these permissions directly.
     For a cross-account hosted zone on EC2, pass the assumable DNS role ARN to the proxy as `AWS_ROUTE53_ROLE`.
     OpenRemote's EC2 CloudFormation template puts this variable in `/etc/environment` from `DNSHostedZoneRoleArn`. For other deployments, pass it through your Compose environment.
   - If you manage the wildcard certificate externally, mount a PEM file containing the full certificate chain and the private key in the proxy's `CUSTOM_CERT_DIR` (default `/data/proxy/certs`).
     See the [custom certificate format](https://github.com/openremote/proxy#custom-certificate-format).
3. Allow inbound TCP `443` to the central proxy for browsers and TCP `2222` to sish from the edge gateways.
   Allow TCP `80` if the proxy uses the HTTP-01 challenge to issue the central Manager's certificate.
   If you use raw TCP tunnels, also allow the published TCP range from the clients that need it.

### Docker Compose

The fragment below contains only the settings needed for gateway tunnels.
For a deployment based on the OpenRemote custom project template, merge the fragment into the `docker-compose.yml` at the root of your custom project repository.
See the [root Compose file in `openremote/custom-project`](https://github.com/openremote/custom-project/blob/main/docker-compose.yml).
Keep the rest of the deployment configuration and update the `sish` service if it already exists.
See the [Core deployment profile](https://github.com/openremote/core/blob/main/profile/deploy.yml) for the surrounding service configuration.
Set `SISH_VERSION=v4.1.1` in your deployment environment to pin [sish v4.1.1](https://github.com/antoniomika/sish/releases/tag/v4.1.1).
Compose uses the `latest` tag when `SISH_VERSION` is unset or empty.
The example assumes the deployment already supplies the `deployment-data` volume.
Put the central key files in that volume or replace the mount with a bind mount such as `./deployment:/deployment` using the central deployment's key directory.

```yaml
# Gateway tunneling settings to merge into the central docker-compose.yml
networks:
  sish-proxy:
    ipam:
      config:
        - subnet: ${SISH_PROXY_SUBNET:-172.30.255.0/29}

services:
  proxy:
    networks:
      default:
      sish-proxy:
        ipv4_address: ${SISH_PROXY_IP:-172.30.255.6}
    environment:
      SISH_HOST: sish
      SISH_PORT: "8090"

  manager:
    environment:
      OR_GATEWAY_TUNNEL_SSH_HOSTNAME: ${OR_HOSTNAME:?Set OR_HOSTNAME}
      OR_GATEWAY_TUNNEL_SSH_PORT: "2222"
      OR_GATEWAY_TUNNEL_TCP_START: "9000"
      OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: "20"

  sish:
    image: antoniomika/sish:${SISH_VERSION:-latest}
    restart: always
    networks:
      - sish-proxy
    ports:
      - "2222:2222"
      - "9000-9100:9000-9100"
    volumes:
      - deployment-data:/deployment
    command: |
      --ssh-address=:2222
      --http-address=:8090
      --http-trusted-proxies=${SISH_PROXY_IP:-172.30.255.6}
      --https=false
      --proxy-ssl-termination=true
      --verify-ssl=false
      --idle-connection=false
      --authentication-keys-directory=/deployment/sish/pubkeys
      --private-keys-directory=/deployment/sish/keys
      --port-bind-range=9000-9100
      --bind-random-ports=false
      --bind-random-subdomains=false
      --domain=${OR_HOSTNAME:?Set OR_HOSTNAME}
      --force-requested-subdomains=true
```

- Set `OR_HOSTNAME` to `central.example.com` or your deployment hostname before rendering the Compose configuration.
- Keep sish's HTTP listener on the dedicated network and trust only the fixed HAProxy IP.
  If the subnet overlaps another network, set both `SISH_PROXY_SUBNET` and `SISH_PROXY_IP` to matching values.
- Set `OR_GATEWAY_TUNNEL_HOSTNAME` on the central Manager if users open tunnels under a different hostname than the one they use to open the central Manager UI.
  Use that same hostname for sish's `--domain`, wildcard DNS, and wildcard TLS certificate.
  The `OR_GATEWAY_TUNNEL_SSH_HOSTNAME` and `OR_GATEWAY_TUNNEL_SSH_PORT` settings tell gateways where to connect over SSH.
- For raw TCP tunnels, keep the Manager's starting port, the sish bind range, the Docker port mapping, and the firewall rules in sync.
  Omit the port range mapping if users only need web tunnels.
- Set `OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES` on the central Manager to close tunnels automatically.
  Unset it or set it to `0` to disable the timer.
- `--verify-ssl=false` lets sish reach HTTPS targets that use self-signed certificates on the edge.
  Keep verification enabled when the targets present certificates sish can verify.

### HAProxy forwarding

Start with the [OpenRemote HAProxy configuration](https://github.com/openremote/proxy/blob/main/haproxy.cfg).
Mount the edited file in the central proxy container, for example with `./deployment/proxy/haproxy.cfg:/data/proxy/haproxy.cfg:ro`.
Set `HAPROXY_CONFIG: /data/proxy/haproxy.cfg` in the proxy service's Compose environment.
Keep the `gw-` host rule that selects the sish backend ahead of the `/auth` rule so that login requests for a tunnel reach the edge Keycloak.
Use a plain HTTP backend to `sish:8090`.

In `frontend https`, replace the forwarding header block, including `option forwardfor`, with these rules.
They ensure that sish and the edge services receive the hostname and HTTPS scheme derived by the central proxy.

```haproxy
http-request deny deny_status 400 if { req.hdr(Connection) -i X-Forwarded-For X-Forwarded-Proto X-Forwarded-Host X-Forwarded-Port }
http-request del-header Forwarded
http-request del-header X-Real-IP
http-request del-header X-Forwarded- -m beg
http-request set-header X-Forwarded-For %[src]
http-request set-header X-Forwarded-Proto https
http-request set-header X-Forwarded-Host %[req.hdr(Host)]
http-request set-header X-Forwarded-Port "${HTTPS_FORWARDED_PORT}"
```

## Edge instance setup

### Docker environment variables

Set `OR_GATEWAY_TUNNEL_SSH_KEY_FILE=/deployment/sish/client/client` on the edge Manager.
Mount or provision the private client key at that path and allow outbound TCP to the central sish SSH endpoint on port `2222`.
Make sure the edge Manager can reach the tunnel target from its own network.

For a **private edge gateway** whose Manager UI will be accessed through the tunnel, apply these authentication settings.

| Service  | Setting                                 | Value or action                           |
| -------- | --------------------------------------- | ----------------------------------------- |
| Keycloak | `KC_HOSTNAME`                           | Unset                                     |
| Keycloak | `KC_HOSTNAME_STRICT`                    | `false`                                   |
| Keycloak | `KC_PROXY_HEADERS`                      | `xforwarded` (OpenRemote image default)   |
| Manager  | `OR_KEYCLOAK_DISABLE_ISSUER_VALIDATION` | `true`                                    |
| Manager  | `OR_WEBSERVER_ALLOWED_ORIGINS`          | `"*"` for dynamic tunnel origins          |

Remove the obsolete `KEYCLOAK_ISSUER_BASE_URI` setting from older deployments.
Keycloak uses the incoming proxy headers to generate URLs for the tunnel hostname, and the edge Manager accepts tokens issued under that hostname.
Clear any fixed **Frontend URL** in the edge Keycloak realm if it overrides the tunnel hostname.
For a publicly exposed OpenRemote instance, use a fixed Keycloak hostname and keep token issuer validation enabled.

## Verify the tunnel

Apply the Compose changes on both instances. You can check the resolved configuration with `docker compose config --quiet` before running `docker compose up -d`.

1. In the central Manager, select the realm containing the gateway asset and open **Settings → Gateway Tunnels** with a user who has the [required tunnel roles](../user-guide/080-gateways-and-devices/10-edge-gateway.md#who-can-open-and-view-tunnels).
2. Add a tunnel, select the gateway asset, and set the protocol to **HTTPS**.
   Enter the edge proxy's host and HTTPS port as seen by the edge Manager, typically port `443`.
   For example, use `proxy` if both containers share a Docker network on which the proxy service has that name.
   If you use `localhost`, check `OR_GATEWAY_TUNNEL_LOCALHOST_REWRITE` on the edge Manager.
   The standard Manager image rewrites that target to `172.17.0.1`, which may differ from the address you need.
3. Select **Open** on the tunnel's row. The URL should look like `https://<tunnel-id>.central.example.com`, where the tunnel ID starts with `gw-`.
   Sign in to the edge Manager and confirm that the assets page loads.
   Stop the tunnel from the central Manager and confirm that the URL stops serving the edge UI.

The protocol you select describes the connection to the edge target.
For an HTTP service on the edge, select **HTTP** and use the service's HTTP port. The browser still uses HTTPS to reach the central proxy in this setup.
For **TCP**, use **Copy address** to get the central hostname and the assigned port, then connect with a client for the target protocol.
Tunnel roles control who can open and close tunnels. Access to the forwarded service depends on network reachability and the target service's own authentication.

- **Gateway missing from the list.** Check the selected realm and the edge Manager startup log for the SSH key path. The list shows gateways that report tunnel support.
- **Tunnel fails to open.** Check the gateway connection, outbound access to the sish SSH endpoint, and whether sish has the public key corresponding to the edge's private key.
- **Tunnel opens but the UI or login fails.** Check wildcard DNS and TLS, the HAProxy routing and forwarding headers, and the edge target address and port. Login redirects should use the tunnel hostname.

## Gateway tunneling development setup {#gateway-tunnelling-development-setup}

Use separate Manager instances for the central and edge roles.
You can run either in an IDE using the [HTTPS proxy development profile](./020-setting-up-an-ide.md#with-ssl-and-proxy) or run both stacks in Docker.
When both run on one host, use distinct host ports for services that publish ports.

To test local Manager code in Docker, run `./gradlew clean installDist` in the Core checkout, then rebuild the Manager image with `./manager/build/install/manager` as the build context, relative to the checkout root.
You can set `OR_METRICS_ENABLED: "false"` on a local Manager to disable metrics while testing.

### Edge instance setup

Use the same key and authentication settings as in [Edge instance setup](#edge-instance-setup).
For an IDE-run Manager, set `OR_GATEWAY_TUNNEL_SSH_KEY_FILE` to the absolute path to the private key on the workstation.
Use a target address and port reachable from that Manager process.

### Central instance setup

Apply the same sish and HAProxy configuration to the development stack and bind mount the central keys with `./deployment:/deployment`.
Keep the central proxy on host port `443` for the tunnel URLs generated by the UI.
Set the SSH endpoint to an address reachable from the edge Manager.
If the edge Manager runs in Docker, use a reachable Docker host address or a shared network.
To test automatic closure, set `OR_GATEWAY_TUNNEL_AUTO_CLOSE_MINUTES: "2"` on the central Manager.

For browser testing, use a local domain such as `central.example.test` and a certificate the browser trusts that covers both `central.example.test` and `*.central.example.test`.
Set `DISABLE_ACME: "true"` on the central proxy and mount the certificate in its custom certificate directory.
Use local wildcard DNS or map the central hostname and the exact tunnel hostname to the central proxy in the client machine's `/etc/hosts` file.
For example, if the browser and the central proxy are on the same machine, replace the example tunnel ID with the one generated by the central Manager.

```text
127.0.0.1 central.example.test
127.0.0.1 gw-exampleid.central.example.test
```

To debug a Manager running in Docker, set `JAVA_TOOL_OPTIONS` to `-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8008` and publish `127.0.0.1:8008:8008`.
Use different host debug ports if you attach to both Managers.

Use [Verify the tunnel](#verify-the-tunnel) for a manual end-to-end check.
Core's `GatewayTest` includes a manual `Gateway Tunneling Edge Gateway Integration test` marked `@Ignore`.
It requires a separately running central instance and local gateway settings.
