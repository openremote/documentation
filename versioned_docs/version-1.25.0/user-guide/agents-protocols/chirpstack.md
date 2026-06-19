---
sidebar_position: 3
---

import AssetTypes from './_lorawan-asset-types.md';

# ChirpStack

The ChirpStack agent allows integration of LoRaWAN devices managed by a [ChirpStack](https://www.chirpstack.io/) Network Server.

## How It Works

The ChirpStack agent acts as a bridge between OpenRemote and a **ChirpStack Network Server** by utilizing two primary communication channels:

### Message Exchange (MQTT)

The agent connects to the **ChirpStack MQTT integration** for real-time data flow:
* **Uplink messages:** The agent subscribes to device events to receive sensor data.
* **Downlink messages:** The agent publishes to command topics to send configuration or control packets back to the end-devices.

### Device Management (gRPC API)

The agent utilizes the **ChirpStack gRPC API** to interact with the Network Server's management layer. This is specifically used for:
* **Auto-discovery:** The agent queries the API to list the **devices** registered in ChirpStack.
* **Device Profiles:** For each discovered device, the agent retrieves its related **device profile**. This allows OpenRemote to understand the device type during the automatic asset creation process.

## Agent configuration

The following describes the supported agent configuration attributes:

| Attribute       | Description                                                                                                     | Required | Default                                          |
|-----------------|-----------------------------------------------------------------------------------------------------------------|----------|--------------------------------------------------|
| `MQTTHost`      | The hostname or IP address of the ChirpStack MQTT broker.                                                       | Y        | -                                                |
| `MQTTPort`      | The network port for the MQTT connection.                                                                       | Y        | -                                                |
| `clientId`      | The unique identifier for this agent's session on the MQTT broker.                                              | Y        | -                                                |
| `secureMode`    | Boolean flag indicating if the MQTT connection should use TLS/SSL encryption.                                   | N        | false                                            |
| `resumeSession` | Boolean flag indicating if the MQTT broker should persist the session and queue messages during agent downtime. | N        | false                                            |
| `subscribeQos`  | MQTT Quality of Service level for receiving uplinks (0, 1, 2).                                                  | N        | 0                                                |
| `publishQos`    | MQTT Quality of Service level for sending downlinks (0, 1, 2).                                                  | N        | 0                                                |
| `host`          | The hostname or IP address of the ChirpStack gRPC API.                                                          | Y        | -                                                |
| `port`          | The network port for the ChirpStack gRPC API.                                                                   | N        | secureGRPC==true -> 443, secureGRPC==false -> 80 |
| `applicationId` | The UUID of the ChirpStack application to be integrated.                                                        | Y        | -                                                |
| `apiKey`        | A ChirpStack API Key used to authenticate the gRPC connection.                                                  | Y        | -                                                |
| `secureGRPC`    | Boolean flag to enable gRPC TLS/SSL encryption.                                                                 | N        | false                                            |


**Example:**

```yaml
MQTTHost: 192.168.1.50
MQTTPort: 1883
clientId: or_chirpstack_agent_1
secureMode: false
resumeSession: true
host: 192.168.1.50
port: 8080
applicationId: 7d809e33-d2ad-4ef1-aac8-2be67501c4d3
apiKey: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhd... 
secureGRPC: false
```

## Device to Asset Mapping

To ensure the ChirpStack Agent can automatically create and configure assets, it must be able to map a ChirpStack device to a specific **OpenRemote Asset Type**.

### Auto-discovery Mapping (ChirpStack Tags)

For devices discovered via the gRPC API, the mapping is defined within the **ChirpStack Device Profile**. By adding a specific tag to the profile, you provide the agent with the Asset Type template required to create the asset in OpenRemote:

| Tag Key | Tag Value |
| :--- | :--- |
| `openremote-asset-type` | The exact name of the **OpenRemote Asset Type** (e.g., `WeatherStationAsset`). |

During auto-discovery, the agent reads this tag and creates the corresponding asset in OpenRemote.

### CSV Import Mapping
When importing devices via a CSV file, the asset type is defined directly within the file. The CSV must include a column that specifies the **Asset Type name** for each device record.

For a detailed breakdown of the required columns and an example file, see the [CSV Import Format](#csv-import-format) section below.

## MQTT Agent Link Automation

The ChirpStack agent handles the transmission of sensor data (**uplinks**) and commands (**downlinks**) via the **MQTT protocol**. To eliminate the need for manual configuration of every attribute, the agent automatically provisions these communication links during the discovery or import process.

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
* **[Agent Link Overview](overview.md)**: Deep dive into generic OpenRemote attributes like filters and predicates.