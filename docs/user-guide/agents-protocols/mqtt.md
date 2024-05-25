---
sidebar_position: 7
---

# MQTT

There is an MQTT Agent (Client) in OpenRemote that you can use to connect to an external MQTT Broker. First use the MQTT Agent to establish the connection to the broker. Then create an asset with attribute(s) of the Value Type that matches the incoming/outgoing data, and give those attributes the configuration item 'Agent Link'. In this agent link select your MQTT Agent and add the parameter Publish Topic or Subscription Topic. 
We have no extensive documentation yet, and recommend to [check our forum](https://forum.openremote.io/t/mqtt-agents-publish-subscription/985). 

OpenRemote also has an [MQTT Broker](../manager-apis/manager-apis.md#mqtt-api-mqtt-broker) (or MQTT API). 

## See also

- [Agent overview](overview.md)
- [MQTT Broker](../manager-apis/manager-apis.md#mqtt-api-mqtt-broker)
- [Quick Start](https://github.com/openremote/openremote/blob/master/README.md)
- [Manager UI Guide](../manager-ui/manager-ui.md)
- [Custom Deployment](../deploying/custom-deployment.md)
- [Setting up an IDE](../../developer-guide/setting-up-an-ide.md)
- [Working on the UI](../../developer-guide/working-on-ui-and-apps.md)
