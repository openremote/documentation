# Over-the-air (OTA) firmware updates

Shipping hardware means shipping bugs you will need to fix later. This tutorial shows how to deliver **over-the-air (OTA) firmware updates** to a device fleet using OpenRemote's integration with **[Eclipse hawkBit](https://www.eclipse.org/hawkbit/)** - a dedicated software update server with managed **rollouts** and **campaigns**, not just a file drop.

:::tip Why this matters for OEMs and integrators
OpenRemote integrates a purpose-built rollout engine (hawkBit) for **device lifecycle management**: staged rollouts, target filtering and update status - so you can patch thousands of deployed devices safely rather than pushing a binary and hoping.
:::

## Prerequisites

- A running OpenRemote instance - see the [Quick Start](../20-quick-start.md).
- A hawkBit instance reachable from OpenRemote (can be co-located with your stack).
- Devices whose firmware can poll a hawkBit DDI endpoint and apply an update image.

## Step 1 - Enable the hawkBit integration

Configure OpenRemote to connect to your hawkBit server. Once linked, OpenRemote can represent firmware/device-update state on your assets and surface update actions. See [Firmware updating with Hawkbit](../user-guide/080-gateways-and-devices/40-firmware-updating-with-hawkbit.md) for the supported features and configuration.

## Step 2 - Register devices as hawkBit targets

Each device becomes a **target** in hawkBit. Use a consistent target/controller ID (for example the same serial used during [auto-provisioning](./080-auto-provision-devices-at-scale.md)) so a device's OpenRemote asset and its hawkBit target line up one-to-one.

## Step 3 - Upload a software module and distribution set

1. In hawkBit, create a **software module** containing your new firmware image.
2. Bundle it into a **distribution set** (the versioned package you assign to targets).
3. Tag your targets (for example `region:eu`, `model:v2`, `ring:canary`) so you can roll out by group.

## Step 4 - Create a managed rollout

1. Create a **rollout** against a target filter (e.g. start with the `ring:canary` group).
2. Define rollout groups and success/error thresholds so a failing batch pauses the rollout automatically.
3. Start the rollout and watch devices move through *scheduled → running → finished*.

:::caution
Always start with a small canary group and verify devices come back online and report the new version before rolling out to the whole fleet.
:::

## Step 5 - Track update status in OpenRemote

Monitor update progress and firmware version on the device assets in the Manager. Combine this with [rules](../user-guide/060-rules-and-forecasting/10-create-rules.md) to alert an operator if a device fails to check in after an update.

## Next steps

- Trigger update alerts and escalation with [ML Forecasting Service](../user-guide/100-services/20-service-ml-forecast.md).
- Manage on-site devices behind an [edge gateway with a secure tunnel](../user-guide/080-gateways-and-devices/10-edge-gateway.md).
