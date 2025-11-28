---
sidebar_position: 7
---

# Modbus

The Modbus TCP and RTU agents allow integration of Modbus devices into OpenRemote, enabling communication via Ethernet (TCP) or Serial (RTU).

## How It Works

In OpenRemote, Modbus agents act as Modbus **masters**, communicating directly with Modbus **slave** devices. The agent manages the connection parameters (TCP or Serial) and facilitates reading and writing data to specified registers or coils of the connected Modbus devices.

## Configuring a Modbus Agent

You can configure either **Modbus TCP** or **Modbus RTU** agents:

### Modbus TCP Agent

| Parameter | Description                                 | Required | Default |
| --------- | ------------------------------------------- | -------- | ------- |
| **host**  | IP address or hostname of the Modbus device | Yes      | -       |
| **port**  | TCP port number of the Modbus device        | Yes      | `502`   |
| **Unit ID**          | Modbus device address (1–247 typically)                 | Yes            |


**Example:**

```yaml
host: 192.168.1.50
port: 502
unitId: 1
```

### Modbus RTU Agent

| Parameter          | Description                                  | Required | Default |
| ------------------ |----------------------------------------------| -------- | ------- |
| **serialPort**     | Serial port identifier (e.g., `/dev/ttyUSB0`) | Yes      | -       |
| **Unit ID**          | Modbus device address (1–247 typically)      | Yes            |
| **serialBaudrate** | Baud rate for serial communication           | No       | `38400` |

**Example:**

```yaml
serialPort: /dev/ttyUSB0
serialBaudrate: 9600
unitId: 1
```

## Linking Attributes via Agent Link

Each asset attribute can link to the Modbus agent via an **Agent Link**. Below are the parameters required:

| Parameter                 | Description                                            | Required       |
|---------------------------|--------------------------------------------------------|----------------|
| **Read Type**             | Register type (`COIL`, `DISCRETE`, `HOLDING`, `INPUT`) | Yes (for read) |
| **Read Address**          | Register or coil address                               | Yes (for read) |
| **Read Value Type**       | Data type (`BOOL`, `INT`, `UINT`, `DINT`, `REAL`, etc.) | Yes (for read) |
| **Write Type**            | Register type for write (`COIL`, `HOLDING`)            | Optional       |
| **Write Address**         | Register or coil address for write                     | Optional       |
| **Write Value Type**      | Data type for writing                                  | Optional       |
| **Polling Interval**      | Interval between reads in milliseconds                 | Optional       |
| **Read Registers Amount** | Amount of registers to read                   | Optional       |

**Important:** Modbus addressing in OpenRemote is zero-based.

**Example Attribute Link:**

```yaml
Read Type: HOLDING
Read Address: 24
Read Value Type: UINT
Write Type: HOLDING
Write Address: 0
Write Value Type: UINT
Polling Interval: 5000
```

## Data Types

OpenRemote Modbus integration supports various data types through Apache PLC4X:

* **BOOL:** Boolean (single-bit)
* **INT/UINT:** 16-bit integer (signed/unsigned)
* **DINT/UDINT:** 32-bit integer (signed/unsigned)
* **REAL:** 32-bit floating-point
* **LREAL:** 64-bit floating-point

## Example Configuration

Here’s a full example configuration for a Modbus TCP temperature sensor:

**Agent Configuration:**

```yaml
host: 192.168.1.50
port: 502
unitId: 1
```

**Agent Link Configuration:**

```yaml
Read Type: HOLDING
Read Address: 0
Read Value Type: UINT
Write Type: HOLDING
Write Address: 0
Write Value Type: UINT
Polling Interval: 10000

```

## Notes

* The Modbus agent polls device data periodically based on the configured interval.
* Write operations occur only when attribute values are explicitly changed in OpenRemote.
* Double-check zero-based addressing, especially if your device documentation uses one-based indexing.

## Under the Hood

The Modbus agent uses a Modbus client library (Apache PLC4X for parsing Modbus data types) to handle communication. When you configure a linked attribute with a Read setting, the agent schedules periodic read requests to the device (using the specified function code based on Read Type, e.g. function 0x03 for holding registers  or 0x01 for coils, etc.). The response is parsed according to the Read Value Type (e.g. UINT, BOOL, etc.) and then the attribute's value is updated in OpenRemote. Likewise, when a write is triggered (either on a schedule or when you change an attribute's value), the agent sends the appropriate write command (e.g. 0x06 to write a single register, or 0x05 for a coil) with the value formatted according to the Write Value Type. The use of the ModbusDataType enum for the value types ensures that the byte order and size are handled correctly by the PLC4X library, so you don't have to manually deal with big-endian/little-endian or register ordering concerns - you simply select the correct data type and the agent does the rest.

Note on addressing: Remember that OpenRemote (and PLC4X) use zero-based addressing for Modbus. This is a common source of confusion. Always confirm whether your device documentation lists register addresses starting at 1 or 0, and adjust accordingly. For instance, if a device documentation refers to "Register 100" (but is zero-based internally), you might actually need to use 100 as is. However, if it refers to "Register 40001" (Modbus convention for first holding register), you should use 0. The OpenRemote Modbus agent ultimately converts your given address into the proper Modbus PDU address (e.g. address 0 will be sent as 0x0000 in the request).

Note on data types: The list of supported data types (for Read/Write Value Type) comes from PLC4X's Modbus support. Most standard types are available. For example, if you need to read a 32-bit integer split across two registers (as many devices use), you can choose DINT or UDINT. If you need a 32-bit float, choose REAL. The agent will automatically read the necessary number of registers (two for 32-bit, four for 64-bit, etc.) in one request. If you select a 64-bit type (LINT, ULINT, LREAL), note that it will read four consecutive 16-bit registers (since Modbus registers are 16-bit each) to assemble the 64-bit value. Ensure that adjacent registers are free or belong to the same value in your device, otherwise you might get incorrect data. Booleans (BOOL) correspond to single bits (coils or bits within a register). If you use BOOL on a register type, it will interpret the least significant bit of that register as the boolean value.

Note on write operations: OpenRemote will only perform a write when the attribute value is explicitly set or changed (through the UI, an automation rule, or the API). Simply linking an attribute with write parameters does not continuously write; it only enables writing. The reading (polling) is what happens continuously. If an attribute has both read and write configured, it is effectively read-write: the agent will poll it regularly, and you can also send a new value to the device. If you want write-only (seldom needed), you could configure write parameters and perhaps disable polling (set polling interval to 0 or very high) so it doesn't try to read a non-existent value.

In summary, the Modbus agent allows you to bring data from PLCs, power meters, sensors, and other Modbus-based devices into OpenRemote, and to control those devices, using the Modbus protocol. By setting up the agent with the correct connection parameters and linking attributes with the proper register type, address, and data type, you can integrate Modbus data seamlessly into your OpenRemote project. The flexible configuration (separating read and write settings) accommodates devices that use distinct registers for status and control, and the use of standard data type definitions makes it easier to handle multi-register values. The ongoing documentation efforts and community feedback (see OpenRemote forums) are refining this feature , but with the information above, you should be able to get started with Modbus integration in OpenRemote.
