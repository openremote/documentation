## LoRaWAN Asset Types

When using LoRaWAN agents such as [ChirpStack](chirpstack.md) or [The Things Stack](the-things-stack.md), OpenRemote can automatically provision assets and their communication links.

This automation relies on the use of specific **LoRaWAN Asset Types**. In these types, each attribute that is linked to a device data point must contain an `AGENT_LINK_CONFIG` meta item. This meta item acts as a blueprint, allowing the agent to automatically configure the underlying MQTT protocol agent links.

### Configuration Keys

The `AGENT_LINK_CONFIG` meta item is a `ValueType.ObjectMap` containing the following keys:

| Key | Type | Description |
|:---|:---|:---|
| `uplinkPort` | `Integer` | Filters incoming messages by the LoRaWAN FPort. |
| `valueFilterJsonPath` | `String` | The JSON Path used to extract the value from the payload (see [Payload Formats](#network-server-payload-formats)). |
| `valueConverter` | `Map` | Defines a value converter map for incoming values. |
| `downlinkPort` | `Integer` | The FPort used for sending downlink commands. |
| `writeValueConverter` | `Map` | Maps attribute values (e.g., `TRUE`/`FALSE`) to the required Base64 payloads. |

### Network Server Payload Formats

The `valueFilterJsonPath` specifies the exact location of sensor data within the incoming MQTT message. Because different LoRaWAN network servers wrap the decoded device data in different JSON envelopes, the root of your path must match your specific provider:

| Network Server | Payload Root | Example Path |
| :--- | :--- | :--- |
| **ChirpStack** | `$.object` | `$.object.Temperature` |
| **The Things Stack** | `$.uplink_message.decoded_payload` | `$.uplink_message.decoded_payload.Temperature` |

### Example Asset Type

The example demonstrates how to map a sensor reading (uplink) and a command switch (downlink).

```java
@Entity
public class LoRaWanAsset extends Asset<LoRaWanAsset> {

    // Uplink: Map temperature from Port 2
    public static final AttributeDescriptor<Double> TEMPERATURE = new AttributeDescriptor<>("temperature", ValueType.NUMBER,
        new MetaItem<>(MetaItemType.READ_ONLY),
        new MetaItem<>(MetaItemType.AGENT_LINK_CONFIG, new ValueType.ObjectMap() {{
            putAll(Map.of(
                "uplinkPort", 2,
                // For ChirpStack use $.object... 
                // For The Things Stack use $.uplink_message.decoded_payload...                
                "valueFilterJsonPath", "$.object.Temperature"
            ));
        }})
    ).withUnits(UNITS_CELSIUS);

    // Downlink: Map switch to Base64 payloads on Port 4
    public static final AttributeDescriptor<Boolean> SWITCH = new AttributeDescriptor<>("switch", ValueType.BOOLEAN,
        new MetaItem<>(MetaItemType.AGENT_LINK_CONFIG, new ValueType.ObjectMap() {{
            putAll(Map.of(
                "downlinkPort", 4,
                "writeValueConverter", new ValueType.ObjectMap() {{
                    putAll(Map.of(
                        "TRUE", "DAE=",
                        "FALSE", "DAA="
                    ));
                }}
            ));
        }})
    );
    
    public static final AttributeDescriptor<String> DEV_EUI = new AttributeDescriptor<>("devEUI", ValueType.TEXT, new MetaItem<>(MetaItemType.READ_ONLY));
    public static final AttributeDescriptor<String> VENDOR_ID = new AttributeDescriptor<>("vendorId", ValueType.TEXT, new MetaItem<>(MetaItemType.READ_ONLY));
    public static final AttributeDescriptor<String> MODEL_ID = new AttributeDescriptor<>("modelId", ValueType.TEXT, new MetaItem<>(MetaItemType.READ_ONLY));
    public static final AttributeDescriptor<String> FIRMWARE_VERSION = new AttributeDescriptor<>("firmwareVersion", ValueType.TEXT, new MetaItem<>(MetaItemType.READ_ONLY));
    public static final AttributeDescriptor<Boolean> SUPPORTS_CLASS_C = new AttributeDescriptor<>("supportsClassC", ValueType.BOOLEAN, new MetaItem<>(MetaItemType.READ_ONLY));

    public static final AssetDescriptor<LoRaWanAsset> DESCRIPTOR = new AssetDescriptor<>("molecule-co2", "f18546", LoRaWanAsset.class);    
    
    protected LoRaWanAsset() {
    }

    public LoRaWanAsset(String name) {
        super(name);
    }
}
```

### Downlink Payload Encoding

When sending commands to a LoRaWAN device, the network server (ChirpStack or The Things Stack) requires the raw binary payload to be formatted as a **Base64 encoded string**. 

The `writeValueConverter` is used to perform this data transformation. It maps high-level OpenRemote attribute values to the specific Base64 strings required by the device's hardware commands. 

In the example above, the device expects a 2-byte binary command to toggle a switch:

| Attribute Value | Raw Hex Command | Base64 String | Action |
| :--- | :--- |:---| :--- |
| `TRUE` | `0x0C01` | `DAE=` | Switch On |
| `FALSE` | `0x0C00` | `DAA=` | Switch Off |

### Device Metadata Attributes

To successfully manage LoRaWAN devices, the Asset Type must include specific attributes for identification and hardware context.

#### Mandatory: DevEUI
The `devEUI` attribute is **mandatory**. The agent uses this unique 64-bit identifier to match the physical device on the network server (ChirpStack or The Things Stack) to the corresponding asset in OpenRemote.

#### Optional Attributes
The following attributes are optional. These are typically populated during the **CSV Import** process:

* **vendorId**: The manufacturer of the device (e.g., *Dragino* or *Milesight*).
* **modelId**: The specific hardware model or part number (e.g., *LHT65*).
* **firmwareVersion**: The version of the software running on the device.
* **supportsClassC**: A boolean flag indicating if the device supports Class C (always-on) communication.