---
sidebar_position: 14
---

import AssetTypes from './_lorawan-asset-types.md';

# The Things Stack (TTS)

The TTS agent allows integration of LoRaWAN devices managed by [The Things Stack (V3)](https://www.thethingsindustries.com/docs/the-things-stack/).

## How It Works

The TTS agent acts as a bridge between OpenRemote and a **The Things Stack Network Server** by utilizing two primary communication channels:

### Message Exchange (MQTT)

The agent connects to the **TTS MQTT integration** for real-time data flow:
* **Uplink messages:** The agent subscribes to device events to receive sensor data.
* **Downlink messages:** The agent publishes to command topics to send configuration or control packets back to the end-devices.

### Device Management and Discovery (gRPC API)

The agent utilizes the **The Things Stack gRPC API** as the primary interface for managing device lifecycles and metadata. This is used for:

* **Real-time auto-discovery:** Instead of periodic polling, the agent listens to the gRPC events stream. When a device sends an uplink or performs a `Join`, the agent detects it instantly.
* **Attribute-based Template Identification:** Once a device is detected, the agent queries the gRPC API to retrieve the device's specific metadata. It looks for a custom **TTS device attribute** that defines the **OpenRemote Asset Type**, allowing the agent to apply the correct template automatically.

## Agent configuration

The following describes the supported agent configuration attributes:

| Attribute          | Description                                                                                                    | Required | Default                                          |
|--------------------|----------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------|
| `MQTTHost`         | The hostname or IP address of the TTS MQTT broker.                                                             | Y        | -                                                |
| `MQTTPort`         | The network port for the MQTT connection.                                                                      | Y        | -                                                |
| `clientId`         | The unique identifier for this agent's session on the MQTT broker.                                             | Y        | -                                                |
| `secureMode`       | Boolean flag indicating if the MQTT connection should use TLS/SSL encryption.                                  | N        | false                                            |
| `usernamePassword` | MQTT credentials (JSON format - see below)                                                                     | Y        | -                                                |
| `resumeSession`    | Boolean flag indicating if the MQTT broker should persist the session and queue messages during agent downtime.| N        | false                                            |
| `subscribeQos`     | MQTT Quality of Service level for receiving uplinks (0, 1, 2).                                                 | N        | 0                                                |
| `publishQos`       | MQTT Quality of Service level for sending downlinks (0, 1, 2).                                                 | N        | 0                                                |
| `host`             | The hostname or IP address of the TTS gRPC API.                                                                | Y        | -                                                |
| `port`             | The network port for the TTS gRPC API.                                                                         | N        | secureGRPC==true -> 443, secureGRPC==false -> 80 |
| `applicationId`    | The identifier of the TTS application to be integrated.                                                        | Y        | -                                                |
| `tenantId`         | TTS tenant identifier.                                                                                         | Y        | -                                                |
| `apiKey`           | TTS API key used to authenticate the gRPC connection.                                                          | Y        | -                                                |
| `secureGRPC`       | Boolean flag to enable gRPC TLS/SSL encryption.                                                                | N        | true                                             |

### MQTT Credentials Format

The TTS agent requires the `usernamePassword` attribute to be provided in a specific JSON format. Note that the **username** is the combined Application and Tenant ID, while the **password** is your TTS API Key.

**Format:**

```json
{
  "username": "{applicationId}@{tenantId}",
  "password": "{apiKey}"
}
```

**Example:**

```yaml
MQTTHost: eu1.cloud.thethings.network
MQTTPort: 8883
clientId: or_tts_agent_1
secureMode: true
usernamePassword: >
  {
    "username": "parking-sensors@ttn",
    "password": "NNSXS.FUFJDFQHVP7SRG2FAE3NS26LVDQQMFTKVVBPCGI.YHI2JQ6..."
  }
resumeSession: true
host: eu1.cloud.thethings.network
port: 443
applicationId: parking-sensors
tenantId: ttn
apiKey: NNSXS.FUFJDFQHVP7SRG2FAE3NS26LVDQQMFTKVVBPCGI.YHI2JQ6... 
secureGRPC: true
```

## Device to Asset Mapping

To ensure the TTS agent can automatically create and configure assets, it must map a TTS device to a specific **OpenRemote Asset Type**.

### Auto-discovery Mapping (TTS Attributes)

For devices discovered via the gRPC events stream, the mapping is defined within the **TTS End Device Attributes**. By adding a specific attribute to the device in the TTS Console, you provide the agent with the **Asset Type template** required to create the asset in OpenRemote:

| Attribute Key | Attribute Value |
| :--- | :--- |
| `openremote-asset-type` | The exact name of the **OpenRemote Asset Type** (e.g., `WeatherStationAsset`). |

During auto-discovery, the agent reads this TTS device attribute and creates the corresponding asset in OpenRemote.

### CSV Import Mapping

When importing devices via a CSV file, the asset type is defined directly within the file. The CSV must include a column that specifies the **Asset Type name** for each device record.

For a detailed breakdown of the required columns and an example file, see the [CSV Import Format](#csv-import-format) section below.

## MQTT Agent Link Automation

The TTS agent handles the transmission of sensor data (**uplinks**) and commands (**downlinks**) via the **MQTT protocol**. To eliminate the need for manual configuration of every attribute, the agent automatically provisions these communication links during the discovery or import process.

### Automatic Provisioning Logic

Once a matching Asset Type template is identified, the agent configures the **MQTT Agent Links** based on the following workflow:

1. **Meta item Lookup**: The agent scans the attributes of the selected Asset Type for a meta item named `AGENT_LINK_CONFIG`. For details on the format of this meta item, see [LoRaWAN Asset Types](#lorawan-asset-types).
2. **Link Creation**: The agent uses the template defined in the meta item to generate the specific MQTT topics and data filters required for that individual device.

### Attributes Configured

The following attributes are automatically populated on the resulting agent links to handle the MQTT protocol logic:

* **MQTT Specific**: `subscriptionTopic`, `publishTopic`.
* **Generic Data Processing**: `valueFilters`, `messageMatchPredicate`, `messageMatchFilters`, `writeValue`, and `writeValueConverter`.

## CSV Import Format

Bulk provisioning allows you to create many assets at once. The agent processes each row to instantiate a new asset, using the specified `assetType` to identify which **template** to apply for automatic link configuration.

### CSV Column Structure

> **Note:** The CSV file must **not** contain a header row. The agent identifies the data based on the specific column order defined below.

| Col | Required | Attribute | Description |
| :--- |:---| :--- |:---|
| 1 | **Y**    | `devEUI` | The 16-character hexadecimal unique identifier.|
| 2 | N        | `deviceName` | The display name for the asset in OpenRemote.|
| 3 | **Y**    | `assetType` | The exact name of the **Asset Type template** (case-sensitive).|
| 4 | N        | `vendorId` | The manufacturer of the device.|
| 5 | N        | `modelId` | The specific hardware model identifier.|
| 6 | N        | `firmwareVersion` | The software version on the device.|

### Example File Content

```csv
a84043d8d1842175,Dragino LHT65 1,DraginoLHT65Asset,dragino,lht65,1.8
a84043d8d1842176,Dragino LHT65 2,DraginoLHT65Asset,dragino,lht65,1.8
```

<AssetTypes />

### Reference Documentation
* **[Agent Link Overview](https://docs.openremote.io/docs/user-guide/agents-protocols/overview/)**: Deep dive into generic OpenRemote attributes like filters and predicates.