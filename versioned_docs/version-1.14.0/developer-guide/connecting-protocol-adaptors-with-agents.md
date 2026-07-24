---
sidebar_position: 12
---

# Connecting Protocol adaptors with Agents

The Agent asset is special: you create it to connect some services or devices to the OpenRemote context, so you can manage them as assets, too. It's the glue in OpenRemote that lets you connect external services to the asset model, you connect sensors and actuators.

An agent may be running locally or remotely on a gateway that is closer to the devices you want to connect. The asset details in the OpenRemote context representing your devices and services reflect the latest known state of the things you have deployed in the field.

Protocols are a main extension point of OpenRemote, they translate the messages from and to external systems into reads and writes of the assets and attribute values used by OpenRemote.

When creating an agent asset, you can create protocol configurations, which are a special type of attribute. Each agent attribute that is a protocol configuration then automatically gets its own instance of the protocol you have selected.

Imagine you want to plug several USB adapters into your IoT gateway and have each represented by its own protocol configuration attribute on an agent, for example as a KNX and ZWave configuration. You then also store and update the agent asset location to where the gateway box is located, and customize other attributes that help you manage devices in the field.

You can link any asset attribute in your context to an agent protocol configuration. When an attribute is linked to an agent's protocol configuration, all value change and write operations of the attribute are delegated to the agent and ultimately the protocol implementation.

Whenever a client sends a message to write an attribute value, when that attribute is linked to an agent the message is passed through to the agent and no rules, flows, database and therefore context update is made. The protocol may decide to update the attribute's state in the context, the same way it would perform a regular update from a sensor read. This is how OpenRemote maps attribute value changes to actuator events.

## Agent model and protocol SPI ##

See the KNXProtocol.java as an example as this will give you a good guide of what to do to build protocol:

`agent/src/main/java/org/openremote/agent/protocol/knx/KNXProtocol.java`

Here’s some helpful info:

- Protocols are one instance per Agent; you’ll see that each Protocol has a corresponding Agent class see here for example.
- Each Asset type has a concrete class and Agents are a sub type of Asset so they therefore have their own classes also (this gives us better type safety)
- An Agent's configuration is stored in individual attributes; these attributes are defined in the Agent class.
- agentLink MetaItem now contains all the configuration needed to connect an attribute to a specific Agent
