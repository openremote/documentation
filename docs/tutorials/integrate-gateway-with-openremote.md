---
sidebar_position: 4
---

# Integrate a gateway or controller with a central OpenRemote instance

An example for connecting your personal gateway or controller to OpenRemote. This tutorial explains how to link an individual user's gateway (e.g. Home Asistant, OpenHAB, Smappee) to an OpenRemote central instance. 
This use case is relevant for organisations which want to enable their users to connect their centralised service in OpenRemote to their user's individual gateways or controllers.

## Create a restricted service user in OpenRemote

First of all create a service user in OpenRemote:

* go to the users page and select 'add service user'
* create a (service) user name
* select the Realm role: 'Restricted user' and select which assets this service user shpuld have access (Linked assets)
* select the correct roles: 'read assets' and 'write attributes' to allow the service user to read and write (if you want him to be able to write) to the attributes of the asset he is linked to
* don't forget to add the configuration items 'Acces restricted read' and 'Access restricted write' (if you want him to be able to write to this attribute) to the attributes of the assets the service user is linked to

Once you saved the service user, a secret is generated. Store the secret as you will need it later.

## Linking with Home Assistant

To enable a user of OpenHAB to link to the central OpenRemote instance, the user will need:
* a service user name
* a secret
* the URL path to the asset and attributes the user has access to



## Linking with OpenHAB

To enable a user of OpenHAB to link to the central OpenRemote instance, the user will need:
* a service user name
* a secret
* the URL path to the asset and attributes the user has access to

Within OpenHAB....


**IGNORE: Example to add a figure.**

![Fahrenheit attribute as filled by the flow](img/flow-the-fahrenheit-result.png)
