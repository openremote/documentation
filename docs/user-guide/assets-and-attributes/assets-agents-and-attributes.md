---
sidebar_position: 1
---

# Assets, Agents and Attributes

## Assets
An asset is a digital representation of a physical or logical `Thing` (this is the `Thing` in Internet of Things). An asset is always attached to a realm, so data is not shared between realms so each realm is considered to be a silo. Assets are persisted. `OpenRemote` stores your current asset status in its database, and manages it in rules and flows. This collectively is called the context of your `OpenRemote` system.

## Attributes
Each asset can have one or more attributes that hold a value; a value can be of any type that can be represented as `JSON`. The name of the attribute is used to cross reference it with an attribute descriptor (see below), which provides schema information for the attribute.

## Configuration items
As well as having a value an attribute can have configuration items (called 'meta items' in the code) which control the behaviour of the attribute (link it to an agent for read/write from/to external systems, link to another attribute, configure historical value storage, and much more). Each attribute can have one or more meta items which is essentially a well known named value (meta data) that can be used in various parts of the system to control behaviour of the associated attribute (e.g. an `agentLink` meta item is used to connect an attribute to an agent/protocol).

## Agents
Agents are a special type of asset which link external services/devices with your `OpenRemote` system via protocols (HTTP/TCP/IP/...). The agent itself holds the configuration parameters as attributes and this configuration is passed to an instance of the corresponding protocol; there is a one to one relationship between an agent and a protocol instance. [Read more about agents](../agents-protocols/overview.md)

## Asset tree
Assets can be structured in a hierarchical tree to define some logical hierarchy for a particular use case (e.g. A city has buildings, which has floors, which have presence sensors).

## Asset Type Model
Our asset type model is configurable which allows it to be modelled on the domain objects relevant for the specific use case (energy domain, smart city, etc.). At present it is only possible to configure the asset model in `java` code with the long term aim of allowing configuration via the `Manager UI`. You can [find the default asset type models here](https://github.com/openremote/openremote/tree/master/model/src/main/java/org/openremote/model/asset/impl) and use them as examples to create your own.

The asset model available for a given `OpenRemote` instance can be interrogated using the [Asset Model HTTP API](https://demo.openremote.io/swagger/#/Asset%20Model).

The asset model has the following types and structure:

* Asset type info
  * Asset descriptor (unique within a given `OpenRemote` instance)
  * Attribute descriptor(s) - List of attribute descriptors applicable to this asset type, a given attribute name is unique within a given asset type hierarchy
  * Meta Item descriptor names(s) - List of meta item descriptor names applicable to this asset type, each one is unique within a given `OpenRemote` instance and can be used to lookup the actual meta item Descriptor
  * Value descriptor name(s) - List of value descriptor names applicable to this asset type, each one is unique within a given `OpenRemote` instance and can be used to lookup the actual value descriptor

### Asset type info
Asset type info contains all the descriptors applicable for a given asset type and can be considered the schema definition which is then used for validation and UI generation purposes; the basic asset type is `Thing` which has no attribute constraints but can be used as a generic asset.
The options depend on the asset types loaded into your deployment. You can call the swagger asset model endpoint of a running system to get all asset type info (see `https://YOUR_DEPLOYMENT/swagger/#/Asset%20Model`).

### Asset descriptor
An asset descriptor defines the following information for a specific asset type:

* `name` - this must be unique within a given `OpenRemote` instance and should be the simple `java` class name
* `icon` - an optional icon that can be used by frontend UI to represent asset's of this type on maps etc.
* `colour` - an optional colour that can be used by frontend UI to represent asset's of this type on maps etc.

### Attribute descriptor
An attribute descriptor has a name which refers to the name of the attribute and this must be unique within the asset type hierarchy, it also contains the following information:

* `type` - name of the value type descriptor that describes the data type of the attribute
* `constraints` - value constraints that must be applied to the value (size/length, regex, not empty, etc.)
* `format` - Formatting rules to be applied when converting the value to string representation for UI purposes (number of decimal places, boolean as on/off etc.)
* `units` - array of strings that compose the units for this attribute based on the [HTML5 Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) but with broader unit support (e.g. `["kilo", "metre", "per", "hour"]` → `km/h`) (see [here](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/Constants.java#L73) for a full list of standard unit types that our system supports - additional ones can be used but UI translations must be provided to support these). Currency symbols are also supported by providing an upper case currency code as defined in `ISO 4217 currency codes`, depending on your chosen language the system then takes care of either prepending the currency symbol (`£0.15/kWh`) or appending it (`0.15€/kWh`)
* `meta` - List of default meta items (configuration items) that should be added when this attribute is first created
* `optional` - boolean flag indicating if the attribute must be present (this doesn't control whether or not it must have a value - that is handled by constraints)

### Meta items descriptor
A meta item descriptor has a name which refers to the name of the meta item and this must be unique within the `OpenRemote` instance, it also contains the following information:

* `type` - same as attribute descriptor above
* `constraints` - same as attribute descriptor above
* `format` - same as attribute descriptor above
* `units` - same as attribute descriptor above

For details on the built in meta item descriptors available see [here](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/MetaItemType.java), 
for asset/agent specific configuration items check their wiki pages and/or javadoc.

### Value descriptors
A value descriptor has a name which must be unique within the `OpenRemote` instance, it ultimately describes the shape of the data for serialisation/deserialisation purposes and it also contains the following information:

* `type` - the simple class name of the data type this value descriptor describes
* `jsonType` - the `JSON` type of data type
* `arrayDimensions` - number indicating that the value is an array of data, where each element is of the type described by this descriptor
* `constraints` - same as attribute descriptor above
* `format` - same as attribute descriptor above
* `units` - same as attribute descriptor above

For details on the built in value descriptors available see [here](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java).
