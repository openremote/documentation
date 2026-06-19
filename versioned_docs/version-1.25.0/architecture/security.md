---
sidebar_position: 2
---

# Security

## Realm clients
For each realm created within the Manager (via UI, provisioning code or REST API) a client called `openremote` is automatically created and all the roles defined in [ClientRole](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/security/ClientRole.java) are automatically added to this client.

## Service users
Service users are actually implemented using Keycloak clients with `Service account enabled`, this creates an 'invisible' user account with a username in the format `service-account-${clientId}` (invisible because they don't show in the user list in the Keycloak admin console). The client that is generated  when a service user is created will also have the all the roles defined in [ClientRole](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/security/ClientRole.java) added to this client.
