---
sidebar_position: 8
---

# Auto-provision and onboard OEM devices at scale

If you build and distribute your own hardware, you do not want to register every unit by hand. This tutorial shows how **auto-provisioning** lets a device **self-register** the first time it connects: OpenRemote authenticates it, creates an **asset** of the type you defined, and links its **attributes** to the right MQTT topics — true **zero-touch device onboarding**.

:::tip Why this matters for OEMs and integrators
Provisioning in OpenRemote creates the client credentials **and** the digital asset **and** the attribute links in a single flow, included in the open-source core. That means a freshly flashed device becomes a fully modelled, queryable asset the moment it powers on in the field.
:::

## Prerequisites

- A running OpenRemote instance — see the [Quick Start](../quick-start).
- Superuser access to a realm where your devices will live.
- A device (or test client) that can do MQTT over TLS with an X.509 client certificate — for example an ESP32/ESP8266.

## Step 1 — Define the asset type your device represents

Decide what each device *is* in your model (e.g. a `Thing`, or a custom `EnvironmentSensor` asset type from a custom project). The provisioning flow will create one asset of this type per device, so model the attributes you want populated (temperature, humidity, battery, etc.).

## Step 2 — Create a provisioning configuration

1. Go to the **Provisioning** configuration for your realm (Manager UI).
2. Create an **X.509 provisioning config** and paste the **CA certificate** that signed your device certificates.
3. Select the **asset type** to create per device and set the realm.
4. Choose whether to **auto-link attributes** to standard MQTT topics and whether newly provisioned assets are **disabled until approved** (useful for a manufacturing QA gate).

See [Auto provisioning devices and users](../user-guide/gateways-and-devices/auto-provisioning) for the message format and the full configuration reference.

## Step 3 — Flash devices with a unique certificate

Each unit ships with a unique client certificate signed by your CA. The device's unique ID (for example a serial number embedded in the certificate's common name) becomes the identity OpenRemote uses to create and name the asset.

## Step 4 — Let the device provision itself

On first connection the device publishes a provisioning request to the provisioning topic. OpenRemote validates the certificate against your CA, then:

1. Creates the asset of your chosen type (if it does not already exist).
2. Links its attributes to the device's publish/subscribe topics.
3. Returns the asset ID so the device can start publishing telemetry immediately.

For a concrete firmware example, follow [Connect ESP32 or ESP8266 using MQTT](../user-guide/gateways-and-devices/connect-esp32-or-esp8266-using-mqtt), then point it at your provisioning config instead of a manually created service user.

## Step 5 — Verify and scale

1. Power on one device and confirm a new asset appears in the asset tree with live values.
2. Power on a second unit with a different certificate and confirm a second, separate asset is created.
3. Roll out the remaining fleet — no manual asset creation required.

:::note
Combine this with [multi-tenant realms](./white-label-multi-tenant-iot-platform) so each customer's devices provision straight into that customer's realm.
:::

## Next steps

- Keep field devices current with [OTA firmware updates using hawkBit](ota-firmware-updates-with-hawkbit).
- Deploy a local [edge gateway with a secure tunnel](edge-gateway-secure-tunnel) for sites with intermittent connectivity.
