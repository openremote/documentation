---
sidebar_position: 1
---

# Artnet DMX

:::note

**THIS PROTOCOL IS DISABLED BY DEFAULT AS IT IS NOT MAINTAINED, IF YOU ARE INTERESTED IN THIS PROTOCOL THEN PLEASE GET IN TOUCH `developers[at]openremote.io`.**

:::

The example below describes interactively linking asset attributes to Artnet Servers using the [ArtnetClientProtocol](https://github.com/openremote/openremote/blob/master/agent/src/main/java/org/openremote/agent/protocol/dmx/artnet/ArtnetClientProtocol.java). The following examples assume that you are running the [Demo docker compose profile](../../../developer-guide/docker-compose-profiles#demo-docker-composeyml).

## Setup the basic Artnet connection
The following examples assume that the DMX controller is bound to the loopback address `127.0.0.1` on port `6454`:
1. Login to the manager UI (`https://localhost/manager` `admin/secret`).
2. Select the Assets tab and click `Create asset` at the top of the Asset list on the left.
3. Set the following:
    * `Asset name`: `Artnet Agent`
    * `Parent asset`: `Smart City -> Energy Management -> Stadhuis` and select 'OK'
    * `Asset Type`: Agent
4. Click `Create asset` at the bottom of the screen.
5. Click `Edit asset` and add a new attribute:
    * `Name`: `artnetClient`
    * `Type`: `Artnet Client`
6. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then configure the Attribute configuration by setting/adding configuration items as follows:
    * `Artnet server hostname/IP`: `127.0.0.1`
    * `Artnet server port`: `6454`

**Make sure you click `Add Item` when creating new attribute configuration items.**

7. Click `Save asset` at the bottom of the screen.

You now have a basic ArtnetClientProtocol ready to be linked to by asset attributes; the defaults assume that the DMX controller receives a ByteBuf (Byte array). 

:::note

The protocol configuration status will show as `CONNECTED` even if the server is not actually reachable. This is due to the fact that `UDP` has no notion of a connection.

:::

## Adding light assets
Light assets are conventially added through use of OpenRemote's Import feature.
This feature is available in the ArtNet Agent asset.
While importing, a specific file is expected.
In the case for light assets, this is a specifically formatted JSON file.

The following is an example of the format expected in the Import file;
this example defines two unique lights:
```json
{
	"lights": [
		{
			"lightId": 0,
			"groupId": 0,
			"universe": 0,
			"amountOfLeds": 6,
			"requiredValues": "r,g,b"
		},
		{
			"lightId": 1,
			"groupId": 0,
			"universe": 0,
			"amountOfLeds": 3,
			"requiredValues": "r,g,b,w,a"
		}
	]
}
```

Light definitions can be added to the JSON file by adding new ones in the "lights" array.
Importing the above file, will result in the Manager adding two unique ArtNet lights to the asset tree. Each of the above mentioned lights have certain properties which are necessary for creating the assets and controlling the lights:

* lightId: A unique identifier for the lights. These lights are controlled in ascending order of id per universe.
* groupId: A identifier to sort lights under a group to control multiple lights at once. Default = 0.
* universe: The universe id in which the fixture is configured.
* amountOfLeds: The amount of leds which need to be controlled per fixture (eventually this is needed to determine how often to send the packet to each light fixture). 
* requiredValues: Contains all the required values which are needed to control the fixture.

:::note

All stated properties are expected while importing. The "lightId" attribute must be unique to each specified light.

:::

### Importing light assets

:::note

This step-by-step guide requires the use of the OpenRemote Manager.

:::

To import light assets, a ArtNet Agent must have been added to the asset tree.  
From there, edit the ArtNet Agent's asset.  
By collapsing the "ArtnetProtocolAgent" protocol configuration, you will be able to import Light assets in the "Protocol link import/discovery" attribute.  
Before importing the JSON, an 'parent' asset must be targeted to where the lights will be appended to. We recommend to choose the same asset to were the ArtNet Agent resides.  
Finally the JSON can be imported by making use of the "Upload & import links from file" button.
 

The imported file must suffix with a ".json" file extension.  
The filename doesn't matter to the import and will accept as long as the contents are correctly formatted.

### Import behaviour
Lights aren't blindly appended to the asset tree upon import.  
Light assets are actually synced to the import JSON.  
This means that:
* New assets are added to the asset tree.
* Existing assets are updated in the asset tree.
* Missing assets are removed from the asset tree.

To elaborate:  
The structure of the import JSON will directly be translated to the structure of the asset tree within the OpenRemote Manager.

## See also

- [Agent overview](../overview.md)
- [Quick Start](https://github.com/openremote/openremote/blob/master/README.md)
- [Manager UI Guide](../../manager-ui/manager-ui.md)
- [Custom Deployment](../../deploying/custom-deployment.md)
- [Setting up an IDE](../../../developer-guide/setting-up-an-ide.md)
- [Working on the UI](../../../developer-guide/working-on-ui-and-apps.md)
