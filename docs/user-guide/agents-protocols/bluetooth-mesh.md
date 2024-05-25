---
sidebar_position: 2
---

# Bluetooth Mesh

Connect to a Bluetooth Mesh network via a Bluetooth Mesh proxy. Note that only linux docker host systems with a `bluez` protocol stack is supported.

Make sure that the file `docker-compose.yml` contains the following configuration settings:
```
...
...
volumes:
  ...  
  btmesh-data:
  ...
...
...
  manager:
    ...
    privileged: true
    ...
    ...
    volumes:
      - ...
      - /var/run/dbus:/var/run/dbus
      - btmesh-data:/btmesh
      - ...          
...
...      
```

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `networkKey` | Bluetooth Mesh network key | Text, format: &lt;key index&gt;:&lt;key&gt; (e.g. 0:5EBBC0FE3CCEF029C049B00F27DC8A5C) | Y |
| `applicationKey` | Bluetooth Mesh application key | Text, format: &lt;key index&gt;:&lt;key&gt; (e.g. 0:2AD08F7660AA535FA7DE4C918241F04F) | Y |
| `proxyAddress` | Bluetooth Mesh proxy address - if omitted proxy with best RSSI is selected | Text (e.g. B0:CE:18:A3:0B:09) | N |
| `sourceAddress` | Bluetooth Mesh source unicast address | Text, format: 4 hexadecimal digits (e.g. 199A), range: 0001-7FFF | Y |
| `mtu` | Maximum transmission unit size for Bluetooth Mesh proxy communication - if omitted default value is 20 | [Positive Integer](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L83) | N |
| `sequenceNumber` | Bluetooth Mesh sequence number - if omitted default value is 1 | [Positive Integer](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L83) | N |

## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `address` | Bluetooth Mesh destination unicast address | Text, format: 4 hexadecimal digits (e.g. 0002), range: 0001-7FFF | Y |
| `appKeyIndex` | Bluetooth Mesh application key index | Positive Integer | Y |
| `modelName` | Bluetooth Mesh model name | Text (e.g. GenericOnOffClient) | Y | 
 
Note that currently only the `GenericOnOffClient` Bluetooth Mesh model is supported.
