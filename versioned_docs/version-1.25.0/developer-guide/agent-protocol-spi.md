---
sidebar_position: 13
---

# Agent and protocol SPI

See the `HTTPProtocol.java` as an example as this will give you a good guide of what to do to build protocol:

`agent/src/main/java/org/openremote/agent/protocol/http/HTTPProtocol.java`

Here’s some helpful info:

- Protocols are one instance per Agent; you’ll see that each Protocol has a corresponding Agent class see here for example.
- Each Asset type has a concrete class and Agents are a sub type of Asset so they therefore have their own classes also (this gives us better type safety)
- An Agent's configuration is stored in individual attributes; these attributes are defined in the Agent class.
- agentLink MetaItem now contains all the configuration needed to connect an attribute to a specific Agent
