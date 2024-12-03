---
sidebar_position: 4
---

# MQTT Gateway API
:::warning

This feature is currently under development and is a work in progress. It has not been merged into the main branch and is subject to change. You can find the branch [here](https://github.com/openremote/openremote/tree/feature/mqtt-gateway-api).

:::

![image](img/mqtt-gateway-communication-flow.png)


The MQTT Gateway API offers a comprehensive suite of device management controls and event subscriptions. It is designed to enable users and developers to create their own custom IoT gateways that are tailored to their specific situations and use cases.

## Authentication
Authentication requires a 'Service User' username and secret, using the standard MQTT username and password mechanism to connect to the OpenRemote MQTT Broker.
- Host: Host of the manager (e.g., `demo.openremote.io`).
- Port: 8883 for secure connections (SSL/TLS) or 1883 for non-secure connections.
- Encryption/TLS: Set to 'true' for secure connections (SSL/TLS) or 'false' for non-secure connections.
- Username: `{realm}:{username}`
- Password: `{secret}`
- ClientId: A unique identifier for the client. Avoid using the same ClientId for simultaneous connections.

#### Notes
- You must use a Service User, not a regular user.
- The provided ClientId must also be present in the clientId topic matches.
- The MQTT Gateway API provides additional functionality when using a 'Gateway V2 Asset' generated Service User. Using a Service User associated with a Gateway V2 Asset ensures that all operations are performed on behalf of the Gateway V2 Asset. For example, when creating an asset, it will be a child of the Gateway V2 Asset.

### Last Will Publishing
Clients can configure a last will topic and payload as defined in the MQTT specification. The topic and payload can use the standard attribute publish topic/payload, allowing for attribute updates when the client connection is unexpectedly closed. The client must have the necessary permissions to access the specified attribute.

## MQTT API Specification

### Gateway Topics (Gateway V2 Asset)
The gateway topics are only accessible with a **Gateway V2 Asset Service User**.  
A pending event is triggered when an attribute or asset is updated by an external source that is not via the Gateway V2 Asset associated Service User, pending events must be acknowledged by the Gateway V2 Asset before they are persisted.

- **Pending Events**  
  Topic: `{realm}/{clientId}/gateway/events/pending` (Subscribe)  
  Description: Subscribe to pending events for the associated Gateway V2 Asset.

- **Acknowledge Events**  
  Topic: `{realm}/{clientId}/gateway/events/acknowledge` (Publish)  
  Description: Acknowledge the pending event. The acknowledgment ID must be provided as the payload.

### Operations Topics (Publish)
Operations are publish topics that provide asset management functionality. Each operation topic has an associated **response** topic that can be subscribed to, which will receive a success or error response.

#### Notes
- Payloads will always use the JSON format.
- Using a **Gateway V2 Asset Service User** ensures that all operations are performed on behalf of the Gateway V2 Asset. This Service User can only manage assets within the Gateway V2 Asset hierarchy.
- Each operations topic has a **response topic** suffix for receiving a success or error response. Responses will always be in the JSON format. 

> Example response topic:
> `{realm}/{clientId}/operations/assets/{responseIdentifier}/create/response`


#### [Assets](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/Asset.java)

- **Create Asset**  
  Topic: `{realm}/{clientId}/operations/assets/{responseIdentifier}/create`  
  Description: Creates an asset. Requires a valid [asset template](#asset-templates) as the payload. The response identifier is used to correlate the response to the request. Requires a subscription to the response topic to receive the response.  
  Response: [AssetEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/AssetEvent.java)

- **Get Asset**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/get`  
  Description: Requests the data of the specified assetId. Requires a subscription to the response topic to receive the data.  
  Response: [Asset](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/Asset.java)

- **Update Asset**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/update`  
  Description: Updates the specified asset. Requires a valid [asset template](#asset-templates) as the payload.  
  Response: [AssetEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/AssetEvent.java)

- **Delete Asset**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/delete`  
  Description: Deletes the specified asset.  
  Response: [AssetEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/AssetEvent.java)

#### [Attributes](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/Attribute.java)

- **Update Attribute**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/update`  
  Description: Updates the specified attribute of the specified asset.  
  Response: [AttributeEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeEvent.java)

- **Update Multiple Attributes**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/attributes/update`  
  Description: Updates the attributes of the specified asset based on the payload, allowing for multi-attribute updating.  
  Example: [multi-attribute payload](#multi-attribute-update-payload)  
  Response: [AttributeEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeEvent.java) objects.

- **Get Attributes**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/attributes/get`  
  Description: Requests the attribute data of the specified asset.  
  Response: [Attribute](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/Attribute.java) objects.

- **Get Specific Attribute**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/get`  
  Description: Requests the specified attribute data of the specified asset. The attribute data contains the full attribute object.  
  Response: [Attribute](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/Attribute.java) object.

- **Get Attribute Value**  
  Topic: `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/get-value`  
  Description: Requests only the value of the specified attribute of the specified asset. The value is the raw value of the attribute.  
  Response: The value of the attribute.

### Events Topics (Subscribe)
Events are subscription topics that allow for subscribing to various events, such as new assets being created or updates and attribute values being changed. Subscription events allow filtering through the usage of MQTT wildcard masks (+ and #).

#### Notes
- The response from the subscriptions will always be in the JSON format.
- Using a **Gateway V2 Asset Service User** enforces filters being relative to the associated Gateway V2 Asset rather than the realm. This Service User can only receive event data from assets within the Gateway V2 Asset hierarchy.



#### [AssetEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/AssetEvent.java)

- **All Asset Events of the Realm**  
  Topic: `{realm}/{clientId}/events/assets/#`

- **All Asset Events for Direct Children of the Realm**  
  Topic: `{realm}/{clientId}/events/assets/+`

- **All Asset Events for the Specified Asset**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}`

- **All Asset Events for the Descendants of the Specified Asset**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/#`

- **All Asset Events for the Direct Children of the Specified Asset**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/+`

#### [AttributeEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeEvent.java)

- **All Attribute Events of the Realm**  
  Topic: `{realm}/{clientId}/events/assets/+/attributes/#`

- **All Attribute Events for Direct Children of the Realm**  
  Topic: `{realm}/{clientId}/events/assets/+/attributes/+`

- **All Attribute Events of the Realm for the Specified Attribute Name**  
  Topic: `{realm}/{clientId}/events/assets/+/attributes/{attributeName}/#`

- **All Attribute Events for Direct Children of the Realm with the Specified Attribute Name**  
  Topic: `{realm}/{clientId}/events/assets/+/attributes/{attributeName}/+`

- **All Attribute Events for the Specified Asset**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/attributes`

- **All Attribute Events for the Specified Asset with the Specified Attribute Name**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}`

- **All Attribute Events for Descendants of the Specified Asset with the Specified Attribute Name**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}/#`

- **All Attribute Events for Direct Children of the Specified Asset with the Specified Attribute Name**  
  Topic: `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}/+`

:::note

`attributes-value` topic prefix can be used in place of `attributes` to only return the value of the [AttributeEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeEvent.java) rather than the entire event.

:::

***


## Examples & More Information
This section provides examples of the payloads and responses for the MQTT Gateway API.

### Payload Examples

#### [Asset Templates](#asset-templates)
- Asset Templates are JSON objects that define the structure of an asset.
- Asset templates can be obtained through the [Swagger API](https://staging.demo.openremote.io/swagger) by retrieving the asset data of an existing asset.
> ##### Example of an Asset Template
>```json
>{
>  "type": "PresenceSensorAsset",
>  "name":"Hallway A Presence Sensor",
>  "attributes": {
>    "presence": {},
>    "notes": {},
>    "location": {}
>  }
>}
>```
Exact Asset Templates can be retrieved from the Swagger API by retrieving the asset data of an existing asset. [Swagger API](https://staging.demo.openremote.io/swagger)
***

#### [Multi-Attribute Update Payload](#multi-attribute-update-payload)
- The multi-attribute update payload is a JSON object that contains the attribute names and values to be updated.
- The attribute names and values are key-value pairs.
- The attribute names must match the attribute names of the asset.
- The attribute values must match the data type of the attribute.
> ##### Example of a Multi-Attribute Update Payload
> ```json
> {
>  "presence": 1,
>  "notes": "Motion detected"
> }
> ```

### Response Examples

#### [Operation Error Response](#response-errors)
- When an error occurs during an MQTT operation, the response will include an error code and a message.
- The error response is encoded in JSON.
> - Below is an example of an error response for a failed asset creation.
> ```json
> {
>   "type": "error",
>   "error": "BAD_REQUEST",
>   "message": "Asset validation failed: attributes.notes: required attribute is missing, attributes.presence: required attribute is missing, attributes.location: required attribute is missing, : Asset is not valid"
> }
> ```


##### Error Codes
- **BAD_REQUEST**: The request was invalid or cannot be otherwise served. The accompanying error message will explain further.
- **CONFLICT**: The request could not be completed due to a conflict, e.g. duplicate assetId.
- **NOT_FOUND**: The requested resource could not be found. This error can be due to a non-existent asset or attribute.
- **UNAUTHORIZED**: The request could not be authorized due to insufficient permissions.
- **INTERNAL_SERVER_ERROR**: An unexpected condition was encountered, and no more specific message is suitable.

