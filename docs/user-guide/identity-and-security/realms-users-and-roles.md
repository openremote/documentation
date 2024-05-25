---
sidebar_position: 1
---

# Realms, users and roles

Authentication and Authorization in the OpenRemote stack is powered by the [Keycloak](https://www.keycloak.org/) `OpenID Connect Provider` and utilises `OAuth 2.0`. Generally within in an instance of the `OpenRemote` stack the `Keycloak` server is accessible at: `/auth` but should only be used by advanced users that know what they're doing as **you can completely break your instance**.

## Realms
Realms (also known as Tenants) in OpenRemote provide a layer of isolation with each realm having their own users, assets, rules and even UI styling. This allows for multi-tenancy use cases and realms can only be managed by super users. A realm user can only see and access their own realm and resources within this realm, super users are able to access all realms. Individual Realms can be reached at `https://youradress/manager/?realm=realmname`. For more details, see [Realms](../manager-ui/#realms).

## Users
There are two basic types of user within OpenRemote, all can be managed within the Manager UI or programmatically via custom setup code:

### Regular users
These are users that login interactively by filling in their username and password on the login page, in OAuth 2.0 terminology this is the `authorizationCode` grant type.

### Service users
These are users that login programmatically using a client ID and secret and is designed for confidential clients to connect to the `Manager APIs` (i.e. `MQTT`, `Websockets` and/or `HTTP`) without user interaction, in OAuth 2.0 terminology this is the `client_credentials` grant type.

## Roles
Roles (technically composite roles or role groups) can be defined by selecting the various 'read' and 'write' access rights for the various functions of the system. Each realm has it's own set of roles and a user can be assigned zero or more of these roles within their realm and they are composite as they combine together to form the overall authorization/permissions for a user. Roles used by OpenRemote are defined in [ClientRole](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/security/ClientRole.java).

## Realm roles
There are two additional realm roles for users within OpenRemote.

### Restricted user realm role

User set with realm role 'Restricted user' and are linked to one or mores assets will only have visibility to those assets. Note that they will only see the attributes of that asset which have been set to 'restricted access read -or write'. Restricted users will also have the roles they are assigned to.

### Super admin realm role

Within the system we have the concept of super users, these are users in the master realm with the `Super admin` realm role, they have the ability to create and manage realms and everything within any realm. Note that you should additionally give them all 'read/write' roles.
