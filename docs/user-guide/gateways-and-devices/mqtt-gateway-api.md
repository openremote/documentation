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

### Gateway (Gateway V2 Asset)
The gateway topic is used for gateway-like devices/services to receive pending attribute events and process them, allowing them to acknowledge these events. These topics are only available when using a **Gateway V2 Asset Service User**.
> `{realm}/{clientId}/gateway/events/pending` (Subscribe)
- Subscribe to pending events for the associated Gateway V2 Asset.
> `{realm}/{clientId}/gateway/events/acknowledge` (Publish) 
- Acknowledge the pending event. The acknowledgement Id must be provided as the payload.

### Operations (Publish)
Operations are publish topics that provide asset management functionality. Each operation topic has an associated **response** topic that can be subscribed to, which will receive a success or error response.

#### Notes
- Payloads will always use the JSON format.
- Using a **Gateway V2 Asset Service User** ensures that all operations are performed on behalf of the Gateway V2 Asset. This Service User can only manage assets within the Gateway V2 Asset hierarchy.
- Each operations topic has a **response topic** suffix for receiving a success or error response. Error responses are detailed in [Operation Error Response](#response-error-codes).

> Example response topic:
> `{realm}/{clientId}/operations/assets/{responseIdentifier}/create/response`

#### Topics

##### [Assets](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/Asset.java)
- `{realm}/{clientId}/operations/assets/{responseIdentifier}/create` 
Creates an asset, requiring a valid [asset template](#asset-templates) as the payload. The response identifier is used to correlate the response to the request, requiring a subscription to the response topic to receive the response. [Asset Create Response](#asset-create-response).
- `{realm}/{clientId}/operations/assets/{assetId}/get`
Requests the data of the specified assetId, requiring subscription to the response topic to receive the data. [Asset Get Response](#asset-get-response).
- `{realm}/{clientId}/operations/assets/{assetId}/update`
Updates the specified asset, requiring a valid [asset template](#asset-templates) as the payload. [Asset Update Response](#asset-update-response).
- `{realm}/{clientId}/operations/assets/{assetId}/delete`
Deletes the specified asset. [Asset Delete Response](#asset-delete-response).

##### [Attributes](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/Attribute.java)
- `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/update` 
Updates the specified attribute of the specified asset.
- `{realm}/{clientId}/operations/assets/{assetId}/attributes/update`
Updates the attributes of the specified asset based on the payload, allowing for multi-attribute updating. Example: [multi-attribute payload](#multi-attribute-update-payload).
- `{realm}/{clientId}/operations/assets/{assetId}/attributes/get`
Requests the attribute data of the specified asset.
- `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/get`
Requests the specified attribute data of the specified asset. The attribute data contains the full attribute object.
- `{realm}/{clientId}/operations/assets/{assetId}/attributes/{attributeName}/get-value`
Requests only the value of the specified attribute of the specified asset. The value is the raw value of the attribute.

### Events (Subscribe)
Events are subscription topics that allow for subscribing to various events, such as new assets being created or updates and attribute values being changed. Subscription events allow filtering through the usage of MQTT wildcard masks (+ and #).

#### Notes
- The response from the subscriptions will always be in the JSON format.
- Using a **Gateway V2 Asset Service User** enforces filters being relative to the associated Gateway V2 Asset rather than the realm. This Service User can only receive event data from assets within the Gateway V2 Asset hierarchy.

#### Topics

##### [AssetEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/asset/AssetEvent.java)
- `{realm}/{clientId}/events/assets/#`
All asset events of the realm.
- `{realm}/{clientId}/events/assets/+`
All asset events for direct children of the realm.
- `{realm}/{clientId}/events/assets/{assetId}`
All asset events for the specified asset.
- `{realm}/{clientId}/events/assets/{assetId}/#`
All asset events for the descendants of the specified asset.
- `{realm}/{clientId}/events/assets/{assetId}/+`
All asset events for the direct children of the specified asset.

##### [AttributeEvent](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/attribute/AttributeEvent.java)
- `{realm}/{clientId}/events/assets/+/attributes/#`
All attribute events of the realm.
- `{realm}/{clientId}/events/assets/+/attributes/+`
All attribute events for direct children of the realm.
- `{realm}/{clientId}/events/assets/+/attributes/{attributeName}/#`
All attribute events of the realm for the specified attribute name.
- `{realm}/{clientId}/events/assets/+/attributes/{attributeName}/+`
All attribute events for direct children of the realm with the specified attribute name.
- `{realm}/{clientId}/events/assets/{assetId}/attributes`
All attribute events for the specified asset.
- `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}`
All attribute events for the specified asset with the specified attribute name.
- `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}/#`
All attribute events for descendants of the specified asset with the specified attribute name.
- `{realm}/{clientId}/events/assets/{assetId}/attributes/{attributeName}/+`
All attribute events for direct children of the specified asset with the specified attribute name.

***


## Examples & More Information
This section provides examples of the payloads and responses for the MQTT Gateway API.

### Payload Examples

#### [Asset Templates](#asset-templates)
> - Asset Templates are JSON objects that define the structure of an asset.
> - Asset templates can be obtained through the [Swagger API](https://staging.demo.openremote.io/swagger) by retrieving the asset data of an existing asset.
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
> - The multi-attribute update payload is a JSON object that contains the attribute names and values to be updated.
> - The attribute names and values are key-value pairs.
> - The attribute names must match the attribute names of the asset.
> - The attribute values must match the data type of the attribute.
> ##### Example of a Multi-Attribute Update Payload
> ```json
> {
>  "presence": 1,
>  "notes": "Motion detected"
> }
> ```

### Response Examples


#### [Attribute Update Response](#attribute-update-response)
> - The attribute update response is a JSON representation of an [AttributeEvent](#attributeevent) that contains the event type, reference, value and timestamp. The value is the updated value of the attribute.
> - A multi attribute update will return an array of attribute events
> ```json
> {
>   "eventType": "attribute",
>   "ref": {
>     "id": "4Y1FoulaL6ocSwl5ukKl4R",
>     "name": "presence"
>   },
>   "value": "1",
>   "timestamp": 0,
>   "deleted": false
> }
> ```

#### [Asset Create Response](#asset-create-response)
> - The asset create response is a JSON representation of an [AssetEvent](#assetevent) that contains details about the newly created asset, including its ID, version, name, and attributes.
> - The cause will always be CREATE.
> ```json
> {
>   "eventType" : "asset",
>   "cause" : "CREATE",
>   "asset" : {
>     "id" : "2Ps3YZyzUP6X7iasABFmnR",
>     "version" : 0,
>     "name" : "Hallway B Presence Sensor",
>     "accessPublicRead" : false,
>     "parentId" : "3vaPqDQUesMznXSOO7PDps",
>     "realm" : "master",
>     "type" : "PresenceSensorAsset",
>     "attributes" : {
>       "notes" : {
>         "name" : "notes",
>         "type" : "text",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       },
>       "location" : {
>         "name" : "location",
>         "type" : "GEO_JSONPoint",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       },
>       "presence" : {
>         "name" : "presence",
>         "type" : "boolean",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       }
>     }
>   },
>   "timestamp" : 0
> }
> ```

#### [Asset Get Response](#asset-get-response)
> - The asset get response is a JSON representation of an asset that contains details about the asset, including its ID, version, name, and attributes.
> ```json
> {
>   "id" : "4gPRAyQLKpr41k1e0OztGu",
>   "version" : 0,
>   "createdOn" : 1732719696525,
>   "name" : "Hallway B Presence Sensor",
>   "accessPublicRead" : false,
>   "parentId" : "3fwzx7lRFLyAYvjIYjTf0b",
>   "realm" : "gateway",
>   "type" : "PresenceSensorAsset",
>   "path" : [ "3fwzx7lRFLyAYvjIYjTf0b", "4gPRAyQLKpr41k1e0OztGu" ],
>   "attributes" : {
>     "notes" : {
>       "name" : "notes",
>       "type" : "text",
>       "meta" : { },
>       "value" : null,
>       "timestamp" : 1732719696521
>     },
>     "location" : {
>       "name" : "location",
>       "type" : "GEO_JSONPoint",
>       "meta" : { },
>       "value" : null,
>       "timestamp" : 1732719696521
>     },
>     "presence" : {
>       "name" : "presence",
>       "type" : "boolean",
>       "meta" : { },
>       "value" : null,
>       "timestamp" : 1732719696521
>     }
>   }
> }
> ```

#### [Asset Update Response](#asset-update-response)
> - The asset update response is a JSON representation of an [AssetEvent](#assetevent) that contains details about the updated asset, including its ID, version, name, and attributes.
> - The cause will always be UPDATE.
> ```json
> {
>   "eventType" : "asset",
>   "cause" : "UPDATE",
>   "asset" : {
>     "id" : "4Y1FoulaL6ocSwl5ukKl4R",
>     "version" : 0,
>     "createdOn" : 1732715882398,
>     "name" : "Hallway B Presence Sensor",
>     "accessPublicRead" : false,
>     "realm" : "master",
>     "type" : "PresenceSensorAsset",
>     "path" : [ "3vaPqDQUesMznXSOO7PDps", "4Y1FoulaL6ocSwl5ukKl4R" ],
>     "attributes" : {
>       "notes" : {
>         "name" : "notes",
>         "type" : "text",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732718925522
>       },
>       "location" : {
>         "name" : "location",
>         "type" : "GEO_JSONPoint",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732718925522
>       },
>       "presence" : {
>         "name" : "presence",
>         "type" : "boolean",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       }
>     }
>   },
>   "timestamp" : 0
> }
> ```

#### [Asset Delete Response](#asset-delete-response)
> - The asset delete response is a JSON representation of an [AssetEvent](#assetevent) that contains details about the deleted asset, including its ID, version, name, and attributes.
> - The cause will always be DELETE.
> ```json
> {
>   "eventType" : "asset",
>   "cause" : "DELETE",
>   "asset" : {
>     "id" : "2Ps3YZyzUP6X7iasABFmnR",
>     "version" : 0,
>     "createdOn" : 1732716480550,
>     "name" : "Hallway B Presence Sensor",
>     "accessPublicRead" : false,
>     "parentId" : "3vaPqDQUesMznXSOO7PDps",
>     "realm" : "master",
>     "type" : "PresenceSensorAsset",
>     "path" : [ "3vaPqDQUesMznXSOO7PDps", "2Ps3YZyzUP6X7iasABFmnR" ],
>     "attributes" : {
>       "notes" : {
>         "name" : "notes",
>         "type" : "text",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       },
>       "location" : {
>         "name" : "location",
>         "type" : "GEO_JSONPoint",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       },
>       "presence" : {
>         "name" : "presence",
>         "type" : "boolean",
>         "meta" : { },
>         "value" : null,
>         "timestamp" : 1732716480547
>       }
>     }
>   },
>   "timestamp" : 0
> }
> ```

#### [Operation Error Response](#response-error-codes)
> - When an error occurs during an MQTT operation, the response will include an error code and a message.
> - The error response is encoded in JSON.
> - Below is an example of an error response for a failed asset creation.
> ```json
> {
>   "type": "error",
>   "error": "BAD_REQUEST",
>   "message": "Asset validation failed: attributes.notes: required attribute is missing, attributes.presence: required attribute is missing, attributes.location: required attribute is missing, : Asset is not valid"
> }
> ```

##### [Operation Error Codes](#response-error-codes)
- **BAD_REQUEST**: The request was invalid or cannot be otherwise served. The accompanying error message will explain further.
- **CONFLICT**: The request could not be completed due to a conflict, e.g. duplicate assetId.
- **NOT_FOUND**: The requested resource could not be found. This error can be due to a non-existent asset or attribute.
- **UNAUTHORIZED**: The request could not be authorized due to insufficient permissions.
- **INTERNAL_SERVER_ERROR**: An unexpected condition was encountered, and no more specific message is suitable.

