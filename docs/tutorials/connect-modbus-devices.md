---
sidebar_position: 5
---

# Connect Modbus TCP/Serial devices (PLCs, meters, inverters)

**Modbus** is everywhere in industrial and energy hardware — PLCs, energy meters, solar inverters, HVAC controllers. This tutorial shows how to connect Modbus devices to OpenRemote running as a gateway, using the **native Modbus agent**, mapping registers straight onto **asset attributes** over Ethernet (**Modbus TCP**) or serial (**Modbus Serial**).

:::tip Why this matters for OEMs and integrators
The Modbus agent runs **inside the OpenRemote Manager** — there is no separate gateway application to deploy and operate just to speak an industrial protocol. The same is true for KNX, and SNMP and more, which keeps your **industrial IoT** architecture simple.
:::

## Prerequisites

- A running OpenRemote instance — see the [Quick Start](https://docs.openremote.io/docs/quick-start).
- A reachable Modbus device: a Modbus TCP slave on your network, or a Modbus RTU device on a serial line accessible to the Manager host.
- The device's register map (function code, address, data type, scaling).

## Step 1 — Create a Modbus agent

1. On the **Assets** page, click **+** and add a **Modbus TCP Agent** (or **Modbus Serial Agent**).
2. For TCP, set the host/IP and port (default `502`) and the unit/slave ID.
3. For RTU, set the serial port, baud rate, parity and stop bits, and the unit ID.

See the [Modbus agent reference](https://docs.openremote.io/docs/user-guide/agents-protocols/modbus) for all parameters.

## Step 2 — Create the asset that represents the device

Create an asset (e.g. an `ElectricityMeter` or a generic `Thing`) and add attributes for each value you want to read or write — for example `power` (number), `voltage` (number), `relayState` (boolean).

## Step 3 — Link attributes to Modbus registers

For each attribute, add the **Agent Link** configuration item and select your Modbus agent, then specify:

- the **register type** (coil, discrete input, input register, holding register),
- the **address**,
- the **data type** (e.g. `INT16`, `UINT32`, `FLOAT32`),
- the **read/write** behaviour and a **polling interval**,
- optional **scaling** to convert raw registers into engineering units.

:::note
Writing to a holding register or coil lets you actuate the device (e.g. toggle a relay) straight from an attribute write, the Manager UI, the REST API, or a rule.
:::

## Step 4 — Verify live data

1. Open the asset and confirm attribute values update on each poll.
2. Check the History panel to confirm values are being stored as time series.
3. Test a write by changing a writable attribute and confirming the device responds.

## Step 5 — Turn raw values into insight

Use [Flow rules](https://docs.openremote.io/docs/user-guide/rules-and-forecasting/flow-rules) to derive virtual attributes (e.g. compute energy from power), and [When-Then rules](https://docs.openremote.io/docs/user-guide/rules-and-forecasting/when-then-rules) to alarm on thresholds.

## Next steps

- Deploy a local [edge gateway with a secure tunnel](./edge-gateway-secure-tunnel) for sites with intermittent connectivity.

