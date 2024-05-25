---
sidebar_position: 14
---

# WebSocket

Connect to a Websocket (`ws`/`wss`) Server.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `connectURL` | Websocket connection URL (`ws`/`wss`); this is used as the base URL for all requests that go through this agent | [HTTP URL](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L196) | Y |
| `connectHeaders` | Headers to be added to the initial connection request | [Multivalued Text Map](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L80) | N |
| `connectSubscriptions` | List of subscriptions that should be made when the protocol connects to the websocket server | [Websocket Subscription[]](https://github.com/openremote/openremote/blob/master/agent/src/main/java/org/openremote/agent/protocol/websocket/WebsocketSubscription.java) | N |

### Websocket Subscriptions
The subscription attribute allows a set of subscriptions to be made when the connection is first established, these subscriptions are executed in the order they appear in the list/array. A subscription can be a Websocket subscription or a HTTP subscription (a simple HTTP request), this covers most real world websocket server use cases, as this is a publish-subscribe protocol you quite often need to specify what you want to subscribe to when you connect.


## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `WebsocketAgentLink`) | Y |
| `websocketSubscriptions` | List of subscriptions that should be made when this attribute is linked to the agent | [Websocket Subscription[]](https://github.com/openremote/openremote/blob/master/agent/src/main/java/org/openremote/agent/protocol/websocket/WebsocketSubscription.java) | N |
