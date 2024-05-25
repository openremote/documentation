---
sidebar_position: 4
---

# HTTP

Connect to a HTTP(S) Server.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `baseURL` | Server base HTTP(S) URL; this is used as the base URL for all requests that go through this agent | [HTTP URL](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L192) | Y |
| `followRedirects` | Should the agent follow any redirect responses (e.g. HTTP status code 3xx) | Boolean | N |
| `requestHeaders` | Headers to be added to all requests that go through this agent | [Multivalued Text Map](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L80) | N |
| `requestQueryParameters` | Query parameters to be added to all requests that go through this agent | [Multivalued Text Map](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L80) | N |
| `requestTimeoutMillis` | Request timeout for all requests that go through this agent (ms) | Integer | N (Default = `10000` |

### Example multivalued Text Map
```
{
  "param1": [
    "value1",
    "value2"
  ],
  "param2": [
    "value1",
    "value2"
  ]
}
```

## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

> For clarification; to inject a body into an HTTP request, you can use the `write value` field.

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `HTTPAgentLink`) | Y |
| `path` | The request path (appended to the `baseURL` defined on the agent) | Text | N |
| `method` | The HTTP method used for the request | Text | N (Default = `GET`) |
| `headers` | Headers to be added to this specific request (in addition to any `requestHeaders` defined on the agent) | [Multivalued Text Map](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L192) | N |
| `queryParameters` | Query parameters to be added to this specific request (in addition to any `requestQueryParameters` defined on the agent) | [Multivalued Text Map](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L192) | N |
| `pollingMillis` | Indicates that a polling request should be made every (ms) to populate the attribute with the response | Integer | N |
| `pagingMode` | Enables support for `Link` header for pagination see [here](https://docs.github.com/en/rest/guides/traversing-with-pagination) for details; if this is enabled and the `Link` header is found then all pages are requested and combined before pushing through to the attribute | Boolean | N |
| `contentType` | Sets the `Content-Type` header (convenient alternative to using `headers` | Text | N (Default = `text/plain`) |
