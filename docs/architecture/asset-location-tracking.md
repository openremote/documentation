---
sidebar_position: 4
---

# Asset location tracking

## Terminology
### Asset and asset location
Asset in the scope of this document refers specifically to assets that have a geographical location and asset location refers to a well known attribute called location which is defined on the asset; how the location is updated is specific to the asset type and whether the location attribute is linked to a protocol. Some example scenarios: -

* **GPS Tracker** - A GPS tracker with internet connection (dedicated device, smart phone/watch, etc); the device pushes its location to the server, an asset is used to represent the tracker and its location is updated when an update is received from the physical device. Provides fine grained location data and following concerns must be considered:

  1. Data/battery usage
  2. Privacy issues
  3. Storage of data (current and historical)

* **Smart device with geofence APIs (e.g. Android/iOS)** - A smart device such as a mobile phone (e.g. Android or iOS) that has a geofence API for coarse location tracking; geofences are defined on the device and a callback is triggered when the geofence is:

  1. Entered
  2. Exited
  3. Entered and Exited

* **A plain old asset** - Any asset that doesn't actively monitor its location but instead the location is manually updated by a user or via a protocol.


## Location tracking scenarios
Reasons/use cases for location tracking:

1. Showing an asset on a map
2. Performing some action (e.g. send a notification) when an asset enters/exits a specific region
3. Recording historical location data (privacy issues need consideration and any users should be fully aware)

Scenario 3 is not in the scope of this document and will be ignored; scenario 1 can be achieved by simply plotting the asset on a map and subscribing to location attribute event changes for that asset and updating the map accordingly. Scenario 2 is essentially location triggered rules and is discussed below.

## Location triggered rules
The common use case is to specify a geographical region and to then perform some action when this region is entered, exited or both, this is known as geofencing. It is possible to define location predicates (geofences) in rule LHS and how this is implemented on the affected assets is abstracted away by the OpenRemote manager (i.e. the manager determines whether or not geofence APIs can be used or not - see below). 

### Geofence API vs location updates 
Depending on the asset type/capabilities and the specific project requirements an asset can either continually send location `attribute events` to the manager or the manager could instruct the asset to update its geofence definitions and then the asset notifies the manager when geofences are triggered. Whenever possible geofence APIs on the physical asset should be preferred for efficiency reasons; rules used to determine geofence usage:

1. Asset must support geofence APIs and backend must be able to supply them in required format (specific geofence API adapters - Android/iOS geofence processing can be done in code on those devices but some things like a GPS tracker might not be able to run custom code - have to send SMS for example in specific format)
2. Asset must support a mechanism for pushing geofences to it (geofence definition update - could be a direct mechanism or could be indirect e.g. push notification telling asset to update geofences)

### Assets added/modified
1. Asset is provisioned in the manager (either manually or automatically via a protocol)
2. Asset type and attributes indicate geofence API support (which API and version)
3. Any pre-existing rules that apply to this asset that have location predicates in LHS are then 'pushed' to the asset

### Rules with location predicate added/modified
1. When rules with location predicates are created and/or updated then any existing affected assets that support geofence APIs are notified and expected to update their geofence definitions

### Geofence push and retrieval
How geofences are 'pushed' to assets is handled by GeofenceAdapters that are loaded at runtime using the ServiceLoader mechanism; there is also a JAX-RS endpoint `rules/geofences/{assetId}` that allows assets to pull their geofence definitions when desired (assets that have been offline could call this endpoint to ensure their geofences are up to date, etc.). The structure of the geofence definitions returned by the endpoint is determined by the requested GeofenceAdapter (see below).

### Unsupported assets/rules
If there are rules with location predicates but they cannot be implemented using geofence APIs on the asset and/or the asset doesn't support geofence APIs then the location attribute is expected to be updated using some other mechanism (asset pushes location, protocol polling, manual, etc.)

### Geofence trigger behaviour
When a geofence is triggered on an asset then the asset should update its own location by posting to the public endpoint `asset/public/{assetId}/updateLocation`, the location value sent should be as follows:

* Geofence Enter - Send geofence centre point as location (centre point should have been provided in the geofence definition retrieved from the backend)
* Geofence Exit - Send null (this will clear the devices location and indicate that the asset has left the geofence)

**By using geofence triggers in this way the handling of all location tracked assets can be processed in the same way i.e. the manager rules can compare location asset state changes irrespective of how the asset provides the location data.**

## Geofence Asset Adapters
Refer to the source code for details of the [GeofenceAssetAdapter](https://github.com/openremote/openremote/blob/location/manager/src/main/java/org/openremote/manager/rules/geofence/GeofenceAssetAdapter.java) and how it is used. Currently there is one implementation:

### ORConsoleGeofenceAssetAdapter (Android and iOS consoles)
An asset will use this adapter if it matches the following criteria:
* Asset type: `console`
* Has an attribute called `consoleProviders` whose value contains a console provider with a name of `geofence` and `version` value of `ORConsole`

**This adapter only supports radial geofences (Android and iOS only support this type)**

The geofence definitions returned by this adapter (returned by calling the `api/{realm}/rules/geofences/{assetId}`) endpoint are as follows:

```
[
   {
      id: "23123abd343fed23425d", [unique ID made up from assetId and hashcode of lat, lng and radius]
      lat: 52.0, [latitude of centre point]
      lng: 0.0, [longitude of centre point]
      radius: 100 [size of radial zone in m]
      postUrl: "{realm}/asset/location/{assetId}"
   }
]
```
