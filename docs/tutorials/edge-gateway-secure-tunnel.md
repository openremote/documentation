---
sidebar_position: 7
---

# Deploy OpenRemote as an edge gateway with a secure tunnel

For sites with intermittent connectivity, local control loops or data-residency requirements, you want compute at the edge. This tutorial shows how to run OpenRemote as an **edge gateway**, link it to a **central** instance, and **remotely access** the on-site gateway through a **secure tunnel** — a hybrid **on-premise** plus cloud architecture.

:::tip Why this matters for integrators
The edge gateway is the **same OpenRemote codebase** running on-site, so an instance can act as both server and gateway — the asset model, agents and rules you already know run locally too. Gateway UIs can be reached from the central instance over a secure tunnel for remote maintenance.
:::

## Prerequisites

- Two OpenRemote instances: a **central** instance and an on-site **edge** instance (both from the [Quick Start](https://docs.openremote.io/docs/quick-start) / Docker images; `amd64` and `arm64` are supported, so the edge can run on small hardware).
- Network access from the edge instance out to the central instance.
- Read [OpenRemote as Edge Gateway](https://docs.openremote.io/docs/user-guide/gateways-and-devices/edge-gateway).

## Step 1 — Run OpenRemote on the edge

Deploy a standard OpenRemote instance on the on-site hardware. Connect your local devices to it using whichever agents fit — [Modbus](./connect-modbus-devices), [KNX](../user-guide/agents-protocols/knx), MQTT, Z-Wave, etc. The edge instance keeps working and storing data even if the uplink drops.

## Step 2 — Register the gateway on the central instance

1. On the **central** Manager, create a **Gateway** asset/connection for the site.
2. This issues credentials the edge instance uses to authenticate its outbound connection.

## Step 3 — Connect the edge to the central instance

Configure the edge instance with the central instance's address and the gateway credentials. Once connected, the site's assets become visible and manageable from the central instance, while continuing to run locally.

## Step 4 — Remotely access the gateway UI via the secure tunnel

Open the gateway's local UI from the central instance through the **secure tunnel**, so field engineers can configure and troubleshoot a site without a site visit or a public inbound port. Follow the tunnel setup in [OpenRemote as Edge Gateway](https://docs.openremote.io/docs/user-guide/gateways-and-devices/edge-gateway).

:::caution
Restrict who can open tunnels and access gateway UIs using [roles and restricted users](./enterprise-identity-sso-rbac); remote access to field equipment should be tightly scoped.
:::

## Step 5 — Decide what runs where

Keep latency-sensitive control and local automation in [edge rules](https://docs.openremote.io/docs/user-guide/rules-and-forecasting/create-rules), and use the central instance for cross-site dashboards, fleet-wide rules and long-term analytics.

## Next steps

- Push [OTA firmware updates](./ota-firmware-updates-with-hawkbit) to devices behind the gateway.
- Onboard edge devices automatically with [auto-provisioning](./auto-provision-devices-at-scale).
