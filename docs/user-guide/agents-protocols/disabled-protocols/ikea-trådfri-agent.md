---
sidebar_position: 2
---

# IKEA TRÅDFRI

:::note

**THIS PROTOCOL IS DISABLED BY DEFAULT AS IT IS NOT MAINTAINED, IF YOU ARE INTERESTED IN THIS PROTOCOL THEN PLEASE GET IN TOUCH `developers[at]openremote.io`.**

:::

You can connect an IKEA TRÅDFRI Gateway to the manager. The manager will import all assets automatically. Here we describe the steps you need to take.

## Docker configuration

If you are using Docker (and docker-compose) to run OpenRemote, you need to change the configuration of docker-compose in order to use the IKEA TRÅDFRI protocol.
In the `profile/deploy.yml` file, uncomment the lines below the following line: "# Uncomment to support the IKEA TRÅDFRI protocol. USE AT YOUR OWN RISK.".
This line occurs 6 times in the `profile/deploy.yml` file. Make sure to find all of them.


**Examples:**
```yml
# Uncomment to support the IKEA TRÅDFRI protocol. USE AT YOUR OWN RISK.
network_mode: host
```

```yml
# Uncomment to support the IKEA TRÅDFRI protocol. USE AT YOUR OWN RISK.
# Also remove (or comment) the already existing variables with the same name.
KEYCLOAK_HOST: 127.0.0.1
KEYCLOAK_PORT: 8081
DATABASE_CONNECTION_URL: jdbc:postgresql://localhost/openremote
```
  
## Connect an IKEA TRÅDFRI Gateway

In the following example, you link your existing IKEA TRÅDFRI Gateway by using its IP address, eg. `192.163.1.2`.

1. Login to the manager UI (`https://localhost/manager` as `admin/secret`)
2. Select the Assets tab and click `Create asset` at the top of the Asset list on the left
3. Set the following:
   * Asset name: `Tradfri Agent`
   * Asset Type: `Agent`
4. Click `Create asset` at the bottom of the screen and then click `Edit asset` in the top right
5. Add a new attribute:
   * Name: `Gateway`
   * Type: `IKEA TRÅDFRI`
6. Click `Add attribute` and then expand the new attribute (using the button on the right of the attribute) then configure the Attribute configuration by setting/adding configuration items as follows: 
   * Gateway host: `192.163.1.2`
   * Gateway security code: Fill in the security code of the IKEA TRÅDFRI Gateway (This can be found on the bottom of the gateway)
7. Click `Save asset` at the bottom of the screen

You now have an IKEA TRÅDFRI Agent to communicate with your own IKEA TRÅDFRI Gateway.

The protocol connection status changes to `CONNECTED` as soon as an IKEA TRÅDFRI Gateway is available on the provided host and the correct security code is provided.

## See also

- [Agent overview](../overview.md)
- [Quick Start](https://github.com/openremote/openremote/blob/master/README.md)
- [Manager UI Guide](../../manager-ui/manager-ui.md)
- [Custom Deployment](../../deploying/custom-deployment.md)
- [Setting up an IDE](../../../developer-guide/setting-up-an-ide.md)
- [Working on the UI](../../../developer-guide/working-on-ui-and-apps.md)
