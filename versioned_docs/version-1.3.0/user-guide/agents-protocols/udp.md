---
sidebar_position: 12
---

# UDP

Connect to an UDP Server.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `host` | UDP server hostname or IP address | [Hostname or IP address](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L153) | Y |
| `port` | UDP server port | [Port number](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L148) | Y |
| `bindPort` | UDP server bind port (for responses); if not specified then a random ephemeral port will be used | [Port number](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L148) | Y |


## Agent link
For attributes linked to this agent, the `Default` [Agent Link](overview.md#agent-links) should be used with a `type` value of `Default`.
