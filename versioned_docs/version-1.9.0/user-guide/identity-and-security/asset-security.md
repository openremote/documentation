---
sidebar_position: 2
---

# Asset Security

The superuser has full access across all tenants (realms). An OpenRemote installation has only one superuser, and it's always named `admin` and it's always in the `master` realm. It cannot be renamed or deleted, just like the master realm. Any number of new realms and therefore tenants may be created.

Each realm can have regular users. Those would usually have administrative functions within a realm, they manage the realm. Depending on assigned roles, a regular user may read/write any asset data in the realm or manage other users in the realm.

An asset is by default *private*, it can only be accessed by the superuser or regular users of its realm. This can be relaxed by giving *restricted* or *public* access to assets.

## Restricted access

A realm may have restricted users. The definition of such a user is a regular user that has been linked to a set of assets within its realm. This is a many-to-many relationship, an asset might be linked to many users, and a user might have links to many assets. The position of the assets within the asset tree is not relevant, linking a user with a parent doesn't mean it is linked to its child assets. The existence of linked assets is what makes a user "restricted". Assets which are linked to a user are not private or for managers only, yet still require authentication to access.

Consider the following example: You are the manager of a smart building with many apartments. A realm/tenant has been created for the whole building. The superuser who created the realm gives you a regular account in that realm and all the roles you need. You now want to give the residents of the apartments individual accounts, one per residence. You must limit what the residents can access within the building. Each resident's account should only be able to access a particular Residence asset, representing their apartment, but not the whole Building asset. To further limit access to the necessary minimum, you would then also give each resident access to some Room and Thing assets within the apartment. You would however not give access to any Agent assets, as this would allow the resident to configure connections to actual services and devices. Only managers should be allowed to do that; the same applies to any other assets you want to keep private.

Restricted users can only access their linked assets and depending on assigned roles, may read/write such asset data. The following limitations apply to restricted users/clients:

* When a restricted client reads assets, only dynamic attributes with `AssetMeta#ACCESS_RESTRICTED_READ` and attribute meta items with `MetaItemDescriptor.Access#restrictedRead` are included.

* When a restricted client updates existing assets, new dynamic attributes can be added, but only attributes with `AssetMeta#ACCESS_RESTRICTED_WRITE` can be updated or deleted. Any new attributes are automatically set with `AssetMeta#ACCESS_RESTRICTED_READ` and `AssetMeta#ACCESS_RESTRICTED_WRITE`, thus ensuring that a restricted client can fully access its own attributes. Any added, updated, or removed meta items of attributes must be `MetaItemDescriptor.Access#restrictedWrite`. When a restricted client updates an asset attribute, it is assumed that the client performs an update with a *complete* list of writable meta items, that is, any existing writable meta items of an attribute will be removed and replaced with the writable meta items provided by the client.

* A restricted client can not create or delete assets. A restricted client can not change the name, parent, or realm of an asset. A restricted user can not make an asset public. A restricted user can change the location of an asset.

Note that third-party metadata items (not in the `org.openremote.model.Constants#NAMESPACE`) are never included by default in restricted read/write asset operations. To make third-party meta items read- or writable by restricted clients, provide meta item descriptors and desired access permissions through the `AssetModelProvider` SPI.

## Public (anonymous) access

An asset can be made accessible by public clients without authentication by setting `Asset#accessPublicRead` to `true`, each attribute that should be publicly accessible must also have `Access public read` and/or `Access public write` configuration items as required.
