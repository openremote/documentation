---
sidebar_position: 1
---

# Custom deployment

You can use our [Custom project repository template](https://github.com/openremote/custom-project) as a starting point for you own project. A custom project is a way of extending OpenRemote to provide custom functionality without modifying the main OpenRemote code, thus the custom code can be separately version controlled possibly in a private repo. With it you can change the look of the Manager app, create your own asset types, change map settings, and set up realms, users, and asset on project initialization. 

The template has the recommended project structure and readme files in various places to provide details on the customization of each part. If you do not want to use the Custom project template, you can set it up yourself following this [video](https://www.youtube.com/watch?v=_u2IgdioQR8).

In this guide we will go through the first time setting up your [custom project](../../developer-guide/creating-a-custom-project.md) and give a short explanation of what you can customize. 

## Follow these steps to run your custom project
1. Prepare your [environment](../../developer-guide/preparing-the-environment.md)
2. Clone your repository from the [custom-project template](https://github.com/openremote/custom-project).\
Then initialize and update the openremote submodule with `git submodule init` and `git submodule update --rebase --remote` from your custom project directory after cloning the repo. This is easiest if you have an [SSH-key in your Github account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
3. [Set up your IDE](../../developer-guide/setting-up-an-ide.md). Note that Application run configurations are already prepared when using this template. \
Use `docker-compose -f profile\dev-testing.yml up --build -d` and run the 'Custom Deployment' configuration. You should have two containers running in Docker, and the manager through your IDE.
4. Run the modelWatch gradle task to build the typescript model `./gradlew modelWatch`
5. Next we serve the Manager UI from the `/openremote/ui/app/manager` directory with `npm run serve -- --env config=..\..\..\..\deployment\manager\app`.

With that done you should be looking at the manager on http://localhost:9000/manager/ (log in with admin/secret)

## Customizations
Now you can make customizations to your custom deployment. Each section will have its own readme file to get you on your way. These items can be changed/added as needed in your project:
- [Manager app configuration](#manager-app-configuration-deploymentmanagerapp)
- [Asset types](#asset-type-model)
- [Agents & Protocols](#agents--protocols-agent)
- [Setup code](#setup-code-setup)
- [Map](#map-deploymentmap)
- [Apps](#apps-uiapp)
- [Setting environment variables and docker volume mappings for services](#setting-environment-variables-and-docker-volume-mappings-for-services)
- [Custom domain](#custom-domain)

### Manager app configuration (/deployment/manager/app)
The manager app can be customised to fit you brand. You can for example change the colours and logos (white labeling), exclude asset types from the Add asset dialog and Rules page, make map markers react to attribute changes, and rearrange attributes in separate panels on the Assets page. These settings are also available directly in the manager app, under 'settings/appearance'. For more details view ['Configuring the Manager UI'](configuring-the-manager-ui.md).

:::note

Most of the changes made in the manager_config.json will not be visible to the default 'admin' user (aka the 'Superuser'). This is because that user should not be restricted by what is set in the manager_config. Please create a new user to verify the changes made with the manager config.

:::

### Asset type (/model)
Create your own asset type that fits your product. In the asset type you define its name, icon, and color, and set its attributes with configuration items (called meta items in the code). If you need some inspiration, you can look at OpenRemote's [default asset types](https://github.com/openremote/openremote/tree/master/model/src/main/java/org/openremote/model/asset/impl).

### Agents & Protocols (/agent)
Protocols are a main extension point of OpenRemote, they translate the messages from and to external systems into reads and writes of the assets and attribute values used by OpenRemote. When creating an [agent asset](../../developer-guide/connecting-protocol-adaptors-with-agents.md), you can create protocol configurations, which are a special type of attribute. Each agent attribute that is a protocol configuration then automatically gets its own instance of the protocol you have selected.

### Setup code (/setup)
Define which assets and rules should be present when you deploy your project. You can set attribute values and their configuration items, add realms and users, and create a structure of assets.\
The keycloaksetup is used to prepare realms and users. For inspiration see the [keycloak setup](https://github.com/openremote/openremote/blob/master/setup/src/demo/java/org/openremote/setup/demo/KeycloakDemoSetup.java) of the demo.\
The managersetup is used to prepare assets and attributes. For inspiration see the [manager setup](https://github.com/openremote/openremote/blob/master/setup/src/demo/java/org/openremote/setup/demo/ManagerDemoSetup.java) of the demo.

### Map (/deployment/map)
You can set your own map and its styling by adding them to the deployment directory. Read more about setting up your map: [Working on maps](../../developer-guide/working-on-maps.md). \
Once you have the map file, you can download and customize [mapsettings.json](https://github.com/openremote/openremote/blob/master/manager/src/map/mapsettings.json) to adjust the centerpoint, boundaries, zoomlevel and styling or you can change these directly in the manager app, under 'settings/appearance'. \
If you want to fully customize styling, you can use [Mapbox Studio](https://www.mapbox.com/mapbox-studio) to create your style and copy it into mapsettings.

### Apps (/ui/app)
Here you can add your own custom applications. You can use the Manager app as a template to get started. View this page for more information on [working on the UI](../../developer-guide/working-on-ui-and-apps.md) and using components.

### Setting environment variables and docker volume mappings for services
The following docker compose file details all of the environment variables (e.g. for e-mail or push notifications) and common volume mappings that you may want to use:
https://github.com/openremote/openremote/blob/master/profile/deploy.yml

### Custom domain
If you want to deploy the OpenRemote stack on a custom domain then all that is needed is to ensure that the docker host where the stack is running is reachable using the custom domain name on the following ports:

- `80` HTTP (needed for SSL generation)
- `443` HTTPS
- `8883` MQTT

The `proxy` service uses `letsencrypt` to auto generate the SSL certificate for the domain and it will also auto renew the certificates; if you already have an SSL certificate for the domain then this can be volume mapped into the `proxy` service.

## See Also

- [Installing Docker (incl. SBCs as Raspberry Pi or Odroid)](../../developer-guide/installing-and-using-docker.md)
