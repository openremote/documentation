---
sidebar_position: 5
---

# KNX

Connect to a KNX network via a KNX IP Interface/Router.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `host` | IP Interface/Router hostname or IP address | [Hostname or IP address](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L153) | Y |
| `port` | IP Interface/Router port | [Port number](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L148) | N |
| `NATMode` | Enable NAT mode | Boolean | N (Default = `false`) |
| `routingMode` | Enable Routing mode | Boolean | N (Default = `false`) |
| `messageSourceAddress` | Source group address | Text (KNX Group Address e.g. `1.1.1`) | N (Default = `0.0.0`) |

## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `KNXAgentLink`) | Y |
| `dpt` | The DPT (data point type) of the group address | Text (DPT e.g. `1.001`) | Y |
| `actionGroupAddress` | Group address for attribute write | Text (KNX Group Address e.g. `1.1.1`) | N (Default = `0.0.0`) |
| `statusGroupAddress` | Group address for attribute read | Text (KNX Group Address e.g. `1.1.1`) | N (Default = `0.0.0`) |


## Discovery and Import
To understand discovery and import refer to [Agent and Asset Discovery/Import](overview.md#agent-and-asset-discoveryimport). This protocol supports the following:

* Protocol Asset Import (`*.knxproj`)

Each group address in the project file will create a new asset with a single attribute also with the same name (no spaces in attribute name), the attribute type is determined by the following naming convention:

* Group Address ends with #A - Actuator (executable attribute)
* Group Address ends with #S - Sensor (read only)
* Group Address ends with #SA or #AS - Actuator and sensor

**Only group addresses using this convention will be imported**
