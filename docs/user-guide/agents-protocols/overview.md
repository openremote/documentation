---
sidebar_position: 1
---

# Overview

[Agents](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/agent/Agent.java) are a special type of asset which link external services/devices with your OpenRemote system via protocols; agents can be put into the following categories:

* Specialised agents (Velbus, Z-Wave, KNX, etc.)
* Generic agents (HTTP, TCP, UDP, WS, MQTT, etc.)

## Agent &lt;-&gt; Protocol relationship
Each agent type has a corresponding [Protocol](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/agent/Protocol.java) implementation; the Agent stores the configuration which is then passed to an instance of the Agent's Protocol implementation so there is a one to one relationship. The following attributes are required for all agent types:

| Attribute | Description | Value type |
| ------------- | ------------- | ------------- |
| `agentDisabled` | Disable the agent | Boolean |
| `agentStatus` | The current status of the agent | [Connection Status](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L174) |


## Specialised agents
Specialised agents are ones that understand the message structure of the underlying devices/service and therefore generally require much less configuration in order to link attributes to them.

## Generic agents (IO Agents)
Generic agents  understand nothing about the underlying devices/service and therefore generally require more configuration in order to use them. This gives a lot of flexibility in terms of what devices/services you can communicate with and the `Agent` attributes and `Agent Link` configuration options make it possible to easily configure generic inbound/outbound value processing (convert data type, insert value into bigger message payload etc.), the following attributes can be used on generic IO agents:

| Attribute | Description | Value type |
| ------------- | ------------- | ------------- |
| `messageConvertHex` | Can be used by protocols that support it to indicate that string values should be converted to/from bytes from/to HEX string representation (e.g. 34FD87) | Boolean |
| `messageConvertBinary` | Can be used by protocols that support it to indicate that string values should be converted to/from bytes from/to binary string representation (e.g. 1001010111) | Boolean |
| `messageCharset` | Charset to use when converting byte[] to a string (should default to UTF8 if not specified); values must be string that matches a charset type | Text |
| `messageMaxLength` | Max length of messages received by a Protocol; what this actually means will be protocol specific i.e. for String protocols it could be the number of characters but for Byte protocols it could be the number of bytes. This is typically used for I/O based Protocols | Positive Integer |
| `messageDelimiters` | Defines a set of delimiters for messages received by a Protocol; the first matched delimiter should be used to generate the shortest possible match(This is typically used for I/O based Protocols). | Text[] |
| `messageStripDelimiter` | For protocols that use `messageDelimiters`, this indicates whether or not the matched delimiter should be stripped from the message. | Boolean |

## Agent links
Regular assets are connected to agents by adding an `Agent Link` configuration item to attributes that need connecting, agents can have their own `Agent Link` configuration options but below are the options that are common to all and can be found in the [Agent link](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/agent/AgentLink.java) class; agents that don't have custom options use the `Default` Agent link type. 

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `id` | The agent ID that is the target for this agent link | [Asset ID](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L135) | Y |
| `type` | Agent link type; must be the correct type for the agent/protocol being linked. Agent's that don't have a custom agent link type use the `type` value `Default` | Text | Y |
| `valueFilters` | When an agent protocol updates the value of a linked attribute it can be desirable to filter that value to extract a specific piece of information that should actually be written to the linked attribute; this option defines a series of value filters that incoming messages should pass through before being passed to the agent protocol, the incoming message is passed to each filter in array order and the result of one is the input to the next (i.e. they are composite). The available value filters can be found from the known types in the javadoc but availabe types at the time of writing can be found below | [ValueFilter](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueFilter.java) | N |
| `valueConverter` | Defines a value converter map to allow for basic value type conversion; the incoming value will be converted to JSON and if this string matches a key in the converter then the value of that key will be pushed through to the attribute. An example use case is an API that returns `ACTIVE/DISABLED` text but you want to connect this to a Boolean attribute `true/false` | JSON Object | N |
| `writeValueConverter` | Similar to `valueConverter` but for outbound (Attribute -> Agent protocol) messages | JSON Object | N |
| `writeValue` | Text value to be used for outbound messages; can be used with any attribute type in combination with the dynamic placeholder (see below) or can be used with an attribute of type `ExecutionStatus` (i.e. executable attributes) to determine the value sent to the agent protocol when the attribute execution starts | Text (JSON etc.) | N |
| `messageMatchPredicate` | Used in combination with the `messageMatchFilters`; the predicate is applied to inbound messages (after the `messageMatchFilters` have been applied) and if the predicate matches then the message is said to match the attribute and the attribute will be updated by passing the original message through the value filter(s) and converter | [ValuePredicate](https://github.com/openremote/openremote/blob/a58951f6780176163bad7f58f79ba2a12eb75eb6/model/src/main/java/org/openremote/model/query/filter/ValuePredicate.java) | N |
| `messageMatchFilters` | Used in combination with the `messageMatchPredicate` to allow filtering the inbound message before the match predicate is evaluated | [ValueFilter[]](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueFilter.java) | N |


### Dynamic value injection
When writing to linked attributes it can be desirable to insert the written value into a bigger payload before sending to the agent protocol; the dynamic value placeholder `{$value}` makes this possible and every occurrence within the bigger payload is replaced by the value written to the linked attribute.

### Value filter known types

* [RegexValueFilter](https://github.com/openremote/openremote/blob/a58951f6780176163bad7f58f79ba2a12eb75eb6/model/src/main/java/org/openremote/model/value/RegexValueFilter.jav)
* [SubStringValueFilter](https://github.com/openremote/openremote/blob/a58951f6780176163bad7f58f79ba2a12eb75eb6/model/src/main/java/org/openremote/model/value/SubStringValueFilter.java)
* [JSONPathFilter](https://github.com/openremote/openremote/blob/a58951f6780176163bad7f58f79ba2a12eb75eb6/model/src/main/java/org/openremote/model/value/JsonPathFilter.java)


```
[
    {
        "type": "jsonPath",
        "path": "$..events[?(@.attributeState.ref.name == "targetTemperature")].attributeState.value"
    },
    {
        "type": "regex",
        "pattern": ".*(\\d)$",
        "matchGroup": 1
    },
    {
       "type": "substring",
       "beginIndex": 10,
       "endIndex": 15
    }
]
```

## Executable Linked Attributes
Attributes that have a type of [Attribute Execute Status](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeExecuteStatus.java), if a value of `REQUEST_START` is written to the attribute then the system will look for a `writeValue` field in the Agent Link and if it is found then this value will be written through to the protocol (note that dynamic value injection doesn't work in this scenario as there is no dynamic value).

## Agent and Asset Discovery/Import
Discovery refers to searching for agents/assets in a protocol specific way i.e. discovering what devices are connected.

Import refers to uploading a protocol specific project file (Velbus `.vlp`, KNX `.etsproj`, etc.) and extracting a set of assets from within.

Discovery and/or import support is protocol specific and the following interfaces are used to identify what a given protocol supports:

### [ProtocolInstanceDiscovery](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/protocol/ProtocolInstanceDiscovery.java)

Indicates that a given protocol supports instance/agent discovery. For a protocol to support this the implementing class must be supplied to the AgentDescriptor.

### [ProtocolAssetDiscovery](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/protocol/ProtocolAssetDiscovery.java)

Indicates that a given protocol supports child asset discovery. For a protocol to support this it must implement this interface. When a protocol supports this then it is possible to initiate the import by selecting the `Agent` in the asset viewer and browsing for the protocol specific project file using the import file picker and then initiating the import; any assets then generated by the protocol will be automatically added as children of the `Agent`.

### [ProtocolAssetImport](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/protocol/ProtocolAssetImport.java)

Indicates that a given protocol supports child asset import. For a protocol to support this it must implement this interface. When a protocol supports this then it is possible to initiate the import by selecting the `Agent` in the asset viewer and browsing for the protocol specific project file using the import file picker and then initiating the import; any assets then generated by the protocol will be automatically added as children of the `Agent`.
