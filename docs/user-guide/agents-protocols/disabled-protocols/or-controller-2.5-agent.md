---
sidebar_position: 3
---

# OR Controller 2.5

:::note

**THIS PROTOCOL IS DISABLED BY DEFAULT AS IT IS NOT MAINTAINED, IF YOU ARE INTERESTED IN THIS PROTOCOL THEN PLEASE GET IN TOUCH `developers[at]openremote.io`.**

:::

Controller Protocol is intended to connect an OpenRemote Controller 2.5 to an OpenRemote Manager 3.0. 
We'll explain how you can connect your own controller, or the existing Home Example Demo Controller.

## Connect an OpenRemote Controller
In the following example, you link your own controller by using the its controller address `http://my.controller:8688/controller`.

1. Login to the manager UI (`https://localhost/manager` as `admin/secret`)
2. Select the Assets tab and click `Create asset` at the top of the Asset list on the left
3. Set the following:
   * Asset name: `Controller Agent`
   * Parent asset: `Smart City -> Energy Management -> Stadhuis` and select 'OK'
   * Asset Type: `Agent`
4. Click `Create asset` at bottom of screen and then click `Edit asset` in the top right
5. Click `Edit asset` and add a new attribute:
   * Name: `controllerConfig`
   * Type: `Controller Client`
6. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then configure the Attribute configuration by setting/adding configuration items as follows **(do not forget to click on 'Add item' for every item)** : 
   * Controller Base URI: `http://my.controller:8688/controller`
   * HTTP basic auth username: if a basic auth is defined on the Controller 2.5
   * HTTP basic auth password: if a basic auth is defined on the Controller 2.5
7. Click `Save asset` at bottom of the screen

You now have a Controller protocol to communicate with your own Controller 2.5 as long as you have an internet connection and an attribute will be linked.

The attribute status is DISCONNECTED until a Controller 2.5 is really available on the provided base URL.

We can now add a linked attribute in Manager to the new Agent such that we can get sensors status and execute commands.

## Configuring Attributes to use a Controller Agent
For each different case, we will consider a concrete example and how to implement them in the Manager UI.

### Getting Controller 2.5 sensor status
#### Starting from an example : 
Value of a temperature sensor (named 'tempSensor') on a device name 'HomeDevice' : 
* Controller 2.5: a single command triggers the read of the value and a sensor uses that command to make the value available.

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `homeTemp`
   * Type: `Temperature in Celcius`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: HomeDevice
   * Controller Sensor name: tempSensor

You have in `homeTemp` the temperature returned by the Controller 2.5

### Execute a Controller 2.5 command
#### Starting from an example : 
Send a setpoint command 'tempSetpoint' on device name 'homeDevice'
* Controller 2.5: a single command that sends the temperature setpoint, it takes no parameter. There is no sensor associated with it.

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `setTemp`
   * Type: `Temperature in Celsius`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: HomeDevice
   * Controller Command name: tempCommand

In your Stadhuis asset, you have an attribute where you can click on 'Write' button to execute the command on the linked Controller 2.5.

#### More information
If there is a value into attribute value when you click on 'Write', the attribute value will be added as parameter into the command request to Controller 2.5.

### Execute a Controller 2.5 (text) command
#### Starting from an example : 
Send a play command 'playTV' over IR on device name 'homeDevice'
* Controller 2.5: a single command that sends the IR code, it takes no parameter. There is no sensor associated with it.

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `playSignal`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: HomeDevice
   * Controller Command name: playTV

In your Stadhuis asset, you have an attribute where you can click on 'Write' button to execute the command on the linked Controller 2.5.

#### More information
If there is a value into attribute value when you click on 'Write', the attribute value will be added as parameter into the command request to Controller 2.5.

### Execute a Controller 2.5 multivalue command
#### Starting from an example : 
Control a fan with 3 speeds: low, mid, high on a device name 'homeDevice'
* Controller 2.5: a command to read the state of the fan and a sensor 'fanState' associated with it + commands with no parameter to turn fan off 'fanOff', set it to low speed 'fanLow', medium speed 'fanMed' or high speed 'fanHigh'

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `fanSpeed`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: HomeDevice
   * Controller Sensor name: fanState
   * Controller Commands map: `{ "off": "fanOff", "low": "fanLow", "medium": "fanMed", "high": "fanHigh" }`

In your Stadhuis asset, you have an attribute where you can click on 'Write' button to execute the command linked to the value of the given attribute ("off", "low", "medium" or "high").
And the polling system will keep the attribute value updated with the latest status know of the fan.

#### More information
If you don't want to have a polling to get the status of the sensor, you can simply don't add the item 'Controller Sensor name'.

### Execute a Controller 2.5 switch with a Manager Toggle/Switch
#### Starting from an example : 
Control a light bulb on device name 'HomeDevice'
* Controller 2.5: a command to read the state of the light, a sensor 'lightState' associated with it, a command 'onCmd' to turn light on and a command 'offCmd' to turn light off (with no parameter)

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `lightSwitch`
   * Type: `On/Off toggle`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: HomeDevice
   * Controller Sensor name: lightState
   * Controller Commands map: `{ "true": "onCmd, "false": "offCmd" }`

In your Stadhuis asset, you have a switch/toggle attribute you can check or uncheck and click on 'Write' button to execute the command linked to the value of the switch/toggle.
And the polling system will keep the attribute value updated with the latest status know of the fan.

It is the only case where you have to follow a template for commands map item. You must use true/false as attribute name for the two commands map.

### Controller connection
If the connection is lost with a Controller defined in an Agent, the connection will be checked every 5 seconds until the connection is up and running again. All the linked attributes to the disconnected agent will be put on hold until the connection is back to normal.

### Specify another device name for command execution
#### Starting from an example : 
Set the volume of an amplifier defined on two different device name on a Controller 'SensorDevice' & 'CmdDevice'
* Controller 2.5:  a command to read the value of the volume and a sensor 'ampVolume' associated with it on device 'SensorDevice' and a command 'setAmpVol' to set the volume taking the level as the argument

#### Configuration:
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `ampLevel`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: SensorDevice
   * Controller Sensor name: ampVolume
   * Controller Device name for command: CmdDevice
   * Controller Command name: `setAmpVol`

In your Stadhuis asset, you have an attribute where the value is updated by polling request and where you can click on 'Write' button to send the command to set the volume with the value of the attribute in parameter.

'Controller Device name for command' is a way to overwrite in the same attribute the device name for command only.

## Home Example Demo on OpenRemote 2.0 (Designer)

As you may know, we have a Home Example representing a typical Residential Application: https://github.com/openremote/Documentation/wiki/Example-Home.

You may find other useful information on : https://github.com/openremote/Documentation/wiki/Example-Home

A demo controller is available online on : http://demo.openremote.com:8688/controller

We'll use the demo Controller in a concrete example here.

### Configure Controller Agent
1. Login to the manager UI (`https://localhost/manager` as `admin/secret`)
2. Select the Assets tab and click `Create asset` at the top of the Asset list on the left
3. Set the following:
   * Asset name: `Controller Agent`
   * Parent asset: `Smart City -> Energy Management -> Stadhuis` and select 'OK'
   * Asset Type: `Agent`
4. Click `Create asset` at bottom of screen and then click `Edit asset` in the top right
5. Click `Edit asset` and add a new attribute:
   * Name: `controllerConfig`
   * Type: `Controller Client`
6. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then configure the Attribute configuration by setting/adding configuration items as follows **(do not forget to click on 'Add item' for every item)** : 
   * Controller Base URI: `http://demo.openremote.com:8688/controller`
7. Click `Save asset` at bottom of the screen

You now have a Controller protocol to communicate with your own Controller 2.5 as long as you have an internet connection and an attribute will be linked.

The attribute status is CONNECTED as the Demo Controller is already available (if you have an internet connection).

We can now add a linked attribute in Manager to the new Agent such that we can get sensors status and execute commands.

### Temperature attribute
On the Demo Controller, we have a sensor for the temperature. We'll catch this information in our manager.

1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `comfortTemp`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: Heating
   * Controller Sensor name: VR1.COMFORT
   * Read Only: checked

You should now have an attribute with a temperature value set to the last version received from the polling on the Controller.

### Increase Comfort temperature
The comfort temperature can be increase or decrease. Let's add the necessary attribute to increase the temperature :
 
1. Select the Smart City -> Energy Management -> Stadhuis asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `incComfortTemp`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: Heating
   * Controller Command name: VR1.COMFORT.inc

Click on 'Save asset' and now you'll have a new attribute available.
If you click on the 'Write' button, it'll send the configured command to the controller. And if we refresh the Asset, we should have a new value for the 'comfortTemp' attribute.

### Decrease Comfort temperature
The comfort temperature can be increased or decreased. Let's add the necessary attribute to decrease the temperature:
 
1. Select the Customer A -> Smart Home asset in the asset list
2. Click `Edit asset` in top right
3. Add a new attribute:
   * Name: `incComfortTemp`
   * Type: `Text`
4. Click `Add attribute` and then expand the new attribute (using button on the right of the attribute) then add the following configuration items:
   * Agent protocol link: Controller Agent -> controllerConfig
   * Controller Device name: Heating
   * Controller Command name: VR1.COMFORT.dec

Click on 'Save asset' and now you'll have a new attribute available.
If you click on the 'Write' button, it'll send the configured command to the controller. And if we refresh the Asset, we should have a new value for the 'comfortTemp' attribute.

## See also

- [Agent overview](../overview.md)
- [Quick Start](https://github.com/openremote/openremote/blob/master/README.md)
- [Manager UI Guide](../../manager-ui/manager-ui.md)
- [Custom Deployment](../../deploying/custom-deployment.md)
- [Setting up an IDE](../../../developer-guide/setting-up-an-ide.md)
- [Working on the UI](../../../developer-guide/working-on-ui-and-apps.md)
