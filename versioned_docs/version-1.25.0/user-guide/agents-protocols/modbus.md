---
sidebar_position: 8
---

# Modbus

The Modbus TCP and RTU agents allow integration of Modbus devices into OpenRemote, enabling communication via Ethernet (TCP) or Serial (RTU).

## How It Works

In OpenRemote, Modbus agents act as Modbus **masters**, communicating directly with Modbus **slave** devices. The agent manages the connection parameters (TCP or Serial) and facilitates reading and writing data to specified registers or coils of the connected Modbus devices. The agents can optimize their read requests by batching multiple registers in one call. This is disabled by default (see [batched requests](#batched-requests)).

## Configuring a Modbus Agent

You can configure either **Modbus TCP** or **Modbus RTU** agents:

### Modbus TCP Agent

| Parameter | Description                                 | Required | Default |
| --------- | ------------------------------------------- | -------- | ------- |
| **host**  | IP address or hostname of the Modbus device | Yes      | -       |
| **port**  | TCP port number of the Modbus device        | Yes      | -       |
| **deviceConfig** | Device (unitID) specific settings, applies "default" setting unless a specific UnitID config is added | No | auto-populated with defaults |


### Modbus RTU Agent

| Parameter          | Description                                  | Required | Default |
| ------------------ |----------------------------------------------| -------- | ------- |
| **serialPort**     | Serial port identifier (e.g., `/dev/ttyUSB0`) | Yes      | -       |
| **serialBaudrate** | Baud rate for serial communication           | No       | `9600` |
| **dataBits**     | Number of data bits per frame | No      | `8`       |
| **parity**     | Parity bit setting (`NONE`, `ODD`, `EVEN`) | No      | `EVEN`       |
| **stopbits**     | Number of stop bits (`STOPBITS_1`, `STOPBITS_2`) | No      | `STOPBITS_1`       |
| **deviceConfig** | Device (unitID) specific settings, applies "default" setting unless a specific UnitID config is added | No | auto-populated with defaults |

### Device Config
While the above settings are applicable for all devices on the bus port, some settings can vary per device (unitId / modbus device address).
The "default" setting is applied to all unitID's unless specified otherwise. If you have a unitID on the bus requiring a different config, add an extra property to the config with that unitID as name.
For example, a specific config for unitID 1 would be:

**Device Config Example:**

```json
{
  "default": {
    "endianFormat": "BIG_ENDIAN",
    "illegalRegisters": "",
    "maxRegisterLength": 1
  },
  "1": {
    "endianFormat": "LITTLE_ENDIAN",
    "illegalRegisters": "23,24,100-200",
    "maxRegisterLength": 40
  }
}
```
Valid parameters are:

| Parameter          | Description                                  |
| ------------------ |----------------------------------------------|
| **endianFormat**     | Byte endianness: `BIG_ENDIAN` (ABCD), `LITTLE_ENDIAN` (DCBA), `BIG_ENDIAN_BYTE_SWAP` (BADC), `LITTLE_ENDIAN_BYTE_SWAP` (CDAB) |
| **illegalRegisters** | Registers not supported by the device (e.g. `"23,24,100-200"`) |
| **maxRegisterLength** | Maximum amount of registers in one request (default: `1`) |

### Batched requests
The settings **illegalRegisters** and **maxRegisterLength** are used to setup combined registers read into a single request. This can significantly reduce traffic on the bus and reduce response times.
By default, maxRegisterlength is set to 1, resulting in no batching. When raising maxRegisterLength, illegalRegister must be used to take into account register ranges that are invalid for that specific device.
For example, when agentlinks are setup to register 1 and 20, this will be combined in one call if maxRegisterLength > 20. However, if a call to register 19 results in an exception response by the device, this will fail, so you would then need to add 19 to illegalRegisters. 
The agent forms groups of batches based on **identical requestInterval, unitID, and readMemoryArea**.

## Linking Attributes via Agent Link

Each asset attribute can link to the Modbus agent via an **Agent Link**. Below are the parameters required:

| Parameter                 | Description                                            | Required       |
|---------------------------|--------------------------------------------------------|----------------|
| **Read Address**          | Register or coil address                               | Yes (for read) |
| **Read Memory Area**      | Register type (`COIL`, `DISCRETE`, `HOLDING`, `INPUT`) | Yes (for read) |
| **Read Value Type**       | Data type (`BOOL`, `INT`, `UINT`, `DINT`, `REAL`, etc.). Also used for multi-register write conversions. | Yes (for read)|
| **Write Address**         | Register or coil address for write                     | Yes (for write)|
| **Write Memory Area**     | Register type for write (`COIL`, `HOLDING`)            | Yes (for write)|
| **Unit Id**               | Modbus device address (1–255). Required for reading. Writes default to `1` if omitted. For TCP, this is typically `1` unless connecting through a Modbus gateway. | Yes (for read) |
| **Request Interval**      | Interval between reads/writes in milliseconds (minimum: 1000). If not set, reads execute once on connection and writes execute on demand only. | Optional       |
| **Registers Amount** | Amount of registers to read/write (automatically determined from data type if not set) | Optional  |

**Important:** Modbus addressing in OpenRemote is **1-based**. Address 1 maps to PDU address 0x0000.

**Example Attribute Link:**

```json
{
  "readAddress": 24,
  "readMemoryArea": "HOLDING",
  "readValueType": "UINT",
  "writeAddress": 24,
  "writeMemoryArea": "HOLDING",
  "unitId": 1,
  "requestInterval": 5000
}
```

## Data Types

OpenRemote Modbus integration supports various data types:

* **BOOL:** Boolean (single-bit)  
* **SINT/USINT/BYTE:** 8-bit integer (signed/unsigned)  
* **INT/UINT/WORD:** 16-bit integer (signed/unsigned)  
* **DINT/UDINT/DWORD:** 32-bit integer (signed/unsigned)  
* **LINT/ULINT/LWORD:** 64-bit integer (signed/unsigned, terms as `long` or `BigInteger` may be used for very large values)  
* **REAL:** 32-bit floating-point  
* **LREAL:** 64-bit floating-point  
* **CHAR/WCHAR:** Character (single or wide, represented as `char` or `String`)  

## Example Configuration

Here’s a full example configuration for a Modbus TCP temperature sensor:

**Agent Configuration:**

```json
{
  "host": "192.168.1.50",
  "port": 502,
  "deviceConfig": {
    "default": {
      "endianFormat": "BIG_ENDIAN",
      "illegalRegisters": "",
      "maxRegisterLength": 1
    }
  }
}
```

**Agent Link Configuration:**

```json
{
  "readAddress": 23,
  "readMemoryArea": "INPUT",
  "readValueType": "REAL",
  "registersAmount": 2,
  "requestInterval": 60000,
  "unitId": 1
}
```

## Under the Hood

The Modbus agent is written for openremote natively. This enables thorough integration into the openremote attribute event model.
When you configure a linked attribute with a Read setting along with a request interval, the agent schedules periodic read requests to the device (using the specified function code based on Read Type, e.g. function 0x03 for holding registers  or 0x01 for coils, etc.). The response is parsed according to the Read Value Type (e.g. UINT, BOOL, etc.) and then the attribute's value is updated in OpenRemote.
With only writing active, the request acknowledgement will be used to determine whether the write was successful, and the attribute value is updated locally. However, it may be the case that you write a setpoint register but want to update the value from another register which holds the actual value (the device may have limits for example). In that case, enable both reading and writing. You can do that either on the same or a different register, depending how the device works. When both reading and writing are active, instead of using the request acknowledgement, the value is immediately read back with a read request after the write request.

### Read/Write Interval & Combinations

| Read Configured | Write Configured | Request Interval Set| Resulting Behavior |
| --------- | ------------------------------------------- | -------- | ------- |
| yes  | no | no     | one time read after agent connects       |
| no  | yes | no     | only writes after attribute is manipulated     |
| yes  | yes       | no      | one time read after agent connects, only writes after attribute is manipulated, then reads back.  |
| yes  | no | yes     | cyclic reads     |
| no  | yes | yes     | cyclic writes (re-sends the current attribute value each interval)     |
| yes  | yes | yes    | cyclic reads; writes are on-demand when the attribute value changes, followed by a verification read |


**Note on addressing:** 
Remember that OpenRemote uses 1-based addressing for Modbus. This is a common source of confusion. Always confirm whether your device documentation lists register addresses starting at 1 or 0, and adjust accordingly. For instance, if a device documentation refers to "Register 100" (but is zero-based), you might actually need to use 101. However, if it refers to "Register 40001" (Modbus convention for first holding register), you should use 1. The OpenRemote Modbus agent ultimately converts your given address into the proper Modbus PDU address (e.g. address 1 will be sent as 0x0000 in the request).

**Note on data types:** Most standard types are available. For example, if you need to read a 32-bit integer split across two registers (as many devices use), you can choose DINT or UDINT. If you need a 32-bit float, choose REAL. The agent will automatically read the necessary number of registers (two for 32-bit, four for 64-bit, etc.) in one request. If you select a 64-bit type (LINT, ULINT, LREAL), note that it will read four consecutive 16-bit registers (since Modbus registers are 16-bit each) to assemble the 64-bit value. Ensure that adjacent registers are free or belong to the same value in your device, otherwise you might get incorrect data. Booleans (BOOL) correspond to single bits when used with coils or discrete inputs. If you use BOOL on a register type (holding/input), any non-zero register value is interpreted as true. Note that there is no separate write value type; multi-register writes use the read value type for data conversion.

**In summary,** the Modbus agent allows you to bring data from PLCs, power meters, sensors, and other Modbus-based devices into OpenRemote, and to control those devices, using the Modbus protocol. By setting up the agent with the correct connection parameters and linking attributes with the proper register type, address, and data type, you can integrate Modbus data seamlessly into your OpenRemote project. The flexible configuration (separating read and write settings) accommodates devices that use distinct registers for status and control, and the use of standard data type definitions makes it easier to handle multi-register values. The ongoing documentation efforts and community feedback (see OpenRemote forums) are refining this feature, but with the information above, you should be able to get started with Modbus integration in OpenRemote. Modbus requests have a 3-second timeout.
