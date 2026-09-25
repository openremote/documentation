# Connect Modbus TCP/Serial devices (PLCs, meters, inverters)

**Modbus** is everywhere in industrial and energy hardware - PLCs, energy meters, solar inverters, HVAC controllers. This tutorial shows how to connect Modbus devices to OpenRemote running as a gateway, using the **native Modbus agent**, mapping registers straight onto **asset attributes** over Ethernet (**Modbus TCP**) or serial (**Modbus Serial**).

:::tip Why this matters for OEMs and integrators
The Modbus agent runs **inside the OpenRemote Manager** - there is no separate gateway application to deploy and operate just to speak an industrial protocol. The same is true for KNX, and SNMP and more, which keeps your **industrial IoT** architecture simple.
:::

## Prerequisites

- A running OpenRemote instance - see the [Quick Start](../20-quick-start.md).
- A reachable Modbus device: a Modbus TCP slave on your network, or a Modbus RTU device on a serial line accessible to the Manager host.
- The device's register map (function code, address, data type, scaling).

## Step 1 - Create a Modbus agent

1. On the **Assets** page, click **+** and add a **Modbus TCP Agent** (or **Modbus Serial Agent**).
2. For TCP, set the host/IP, port and the unit/slave ID.
3. For RTU, set the serial port, baud rate, parity and stop bits, and the unit ID.

See the [Modbus agent reference](../user-guide/040-agents-protocols/080-modbus.md) for all parameters.

## Step 2 - Create the asset that represents the device

Create an asset (e.g. an `ElectricityMeter` or a generic `Thing`) and add attributes for each value you want to read or write - for example `power` (Number), `voltage` (Number), `relayState` (Boolean).

## Step 3 - Link attributes to Modbus registers

For each attribute, add the **Agent Link** configuration item and select your Modbus agent, then specify:

- the **register type** (coil, discrete input, input register, holding register),
- the **address**,
- the **data type** (e.g. `INT16`, `UINT32`, `FLOAT32`),
- the **read/write** behaviour and a **polling interval**,
- the **unit ID**

:::note
Writing to a holding register or coil lets you actuate the device (e.g. toggle a relay) straight from an attribute write, the Manager UI, the REST API, or a rule.
:::

## Step 4 - Verify live data

1. Open the asset and confirm attribute values update on each poll.
2. After adding the **Store data points** configuration item to an attribute, the History panel shows attribute values over time.
3. Test a write by changing a writable attribute and confirming the device responds.

## Step 5 - Turn raw values into insight

Use [Flow rules](../user-guide/060-rules-and-forecasting/30-flow-rules.md) to derive virtual attributes (e.g. compute energy from power), and [When-Then rules](../user-guide/060-rules-and-forecasting/20-when-then-rules.md) to alarm on thresholds.

## Next steps

- Deploy a local [edge gateway with a secure tunnel](./070-edge-gateway-secure-tunnel.md) for sites with intermittent connectivity.

