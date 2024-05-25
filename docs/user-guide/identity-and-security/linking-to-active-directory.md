---
sidebar_position: 3
---

# Linking to Active Directory

Keycloak is the identity manager provider for the OpenRemote platform. It default uses its own Database with the Roles defined in the code for start up.

It's also possible to hook up Keycloak with Active Directory and login with the users that come from AD. Getting the groups is also a possibility and applying the Keycloak roles to the groups.

To read more about Keycloak and LDAP please visit the [Keycloak documentation page](https://www.keycloak.org/docs/3.0/server_admin/topics/user-federation/ldap.html).

## LDAPComponentBuilder

In the package `org.openremote.manager.security` you'll find the `LDAPComponentBuilder` class. This class is all you need to build a `org.keycloak.representations.idm.ComponentRepresentation` which will contain the config to let key cloak communicate with the LDAP.


### Importing users
When the users from AD are imported, the existing users in Keycloak will still be available. To make this possible, it's necessary to add a `ComponentRepresentation` to the Realm used for you application.

Example:
```
RealmResource realmResource = keycloakProvider.getRealms(accessToken).realm(tenant.getRealm());

ComponentRepresentation componentRepresentation = new LDAPComponentBuilder()
    .setName(LDAPComponentBuilder.ProviderId.LDAP_PROVIDER.toString())
    .setProviderType(LDAPComponentBuilder.ProviderType.USER_STORAGE_PROVIDER_TYPE)
    .setProviderId(LDAPComponentBuilder.ProviderId.LDAP_PROVIDER)
    .setParentId(realmResource.toRepresentation().getId())
    .setVendor(LDAPComponentBuilder.Vendor.AD)
    .setEditMode(LDAPComponentBuilder.EditMode.READ_ONLY)
    .setUserNameLDAPAttribute(LDAPComponentBuilder.LDAPConstants.UID)
    .setRDNLDAPAttribute(LDAPComponentBuilder.LDAPConstants.UID)
    .setUUIDLDAPAttribute(LDAPComponentBuilder.LDAPConstants.UID)
    .setUserObjectClasses("inetOrgPerson,organizationalPerson")
    .setConnectionUrl("ldap://ldap.forumsys.com:389")
    .setUsersDn("dc=example,dc=com")
    .setAuthType(LDAPComponentBuilder.AuthType.SIMPLE)
    .setBindDn("cn=read-only-admin,dc=example,dc=com")
    .setBindCredential("password")
    .setCustomUserSearchFilter("(uid=*)")
    .setSearchScope(1)
    .setUseTrustStoreSPI(LDAPComponentBuilder.UseTrustStoreSpi.LDAPS_ONLY)
    .setConnectionPooling(true)
    .setPagination(true)
    .setBatchSizeForSync(1000)
    .setFullSyncPeriod(Constants.ONE_WEEK_IN_SECONDS)
    .setAllowKerberosAuthentication(true)
    .setKerberosRealm("EXAMPLE.COM")
    .setKerberosServerPrincipal("HTTP/admin.example.com@EXAMPLE.COM")
    .setKerberosKeyTabPath("/etc/krb5.keytab")
    .setUseKerberosForPasswordAuthentication(false)
    .setPriority(0)
    .setDebug(false)
    .build();

String ldapConfigId = keycloakProvider.addLDAPConfiguration(new ClientRequestInfo(null, accessToken), realmResource.toRepresentation().getRealm(), componentRepresentation);
```

The following [page](https://www.forumsys.com/tutorials/integration-how-to/ldap/online-ldap-test-server/) will explain about the test server used.


:::note

Don't forget to map the krb5.keytab file from the host to the Keycloak container.

:::

### Importing groups
It's possible to also sync the groups from AD to Keycloak and have the user's membership synced.

To import groups, see the following example:

```
ComponentRepresentation groupMapperComponentRepresentation = new LDAPComponentBuilder()
    .setClientId(KEYCLOAK_CLIENT_ID)
    .setName("GroupMapper")
    .setProviderType(LDAPComponentBuilder.ProviderType.LDAP_STORAGE_MAPPER_TYPE)
    .setProviderId(LDAPComponentBuilder.ProviderId.LDAP_GROUP_PROVIDER)
    .setParentId(ldapConfigId)
    .setMapperMode(LDAPComponentBuilder.MapperMode.IMPORT)
    .setMemberShipAttributeType(LDAPComponentBuilder.MemberShipAttributeType.DN)
    .setMemberShipLDAPAttribute("uniqueMember")
    .setMemberShipUserLDAPAttribute(LDAPComponentBuilder.LDAPConstants.UID)
    .setGroupNameLDAPAttribute("cn")
    .setGroupObjectClasses("groupOfUniqueNames")
    .setGroupsDn("dc=example,dc=com")
    .setDropNonExistingGroupsDuringSync(false)
    .setPreserveGroupInheritance(false)
    .setUserRolesRetrieveStrategy(LDAPComponentBuilder.UserRolesRetrieveStrategy.LOAD_GROUPS_BY_MEMBER_ATTRIBUTE)
    .build();

String mapperId = keycloakProvider.addLDAPMapper(new ClientRequestInfo(null, accessToken), realmResource.toRepresentation().getRealm(), groupMapperComponentRepresentation);
```

### Adding Keycloak Roles to Groups
To have an user which is member of a certain group to get the correct roles from Keycloak, we need to give the group the correct roles.

Example:
```
String clientId = getClientObjectId(realmResource.clients());//function to get the correct client id
RolesResource rolesResource = realmResource.clients().get(clientId).roles();

GroupsResource groupResource = realmResource.groups();
for (GroupRepresentation groupRepresentation : groupResource.groups()) {
    if (groupRepresentation.getName().equals("Scientists")) {
        groupResource.group(groupRepresentation.getId()).roles().clientLevel(clientId)
            .add(Arrays.asList(
                rolesResource.get(ClientRole.READ_MAP.getValue()).toRepresentation(),
                rolesResource.get(ClientRole.READ_ASSETS.getValue()).toRepresentation(),
                rolesResource.get(ClientRole.WRITE_ASSETS.getValue()).toRepresentation(),
                rolesResource.get(ClientRole.WRITE_USER.getValue()).toRepresentation()
                )
            );
    } else if (groupRepresentation.getName().equals("Mathematicians")) {
        groupResource.group(groupRepresentation.getId()).roles().clientLevel(clientId)
            .add(Arrays.asList(
                rolesResource.get(ClientRole.READ_MAP.getValue()).toRepresentation(),
                rolesResource.get(ClientRole.READ_ASSETS.getValue()).toRepresentation()
                )
            );
    } //etc...
}
```
