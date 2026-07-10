# Enterprise identity - SSO, RBAC and OAuth2

How does our platform handle **identity and access**? This tutorial covers the essentials: **single sign-on (SSO/OIDC)** through the built-in **Keycloak**, linking to **Active Directory/LDAP**, **role-based access control (RBAC)** with realms and restricted users, and **OAuth2 service accounts** for headless device and machine access.

:::tip Why this matters for enterprise users
Industry-standard identity is built into the open-source core: Keycloak-based authentication, fine-grained roles, restricted (per-asset) users, federated SSO and OAuth 2.0 service users - no separate edition required to satisfy an enterprise security review.
:::

## Prerequisites

- A running OpenRemote instance - see the [Quick Start](../quick-start).
- Superuser access; ideally a [tenant realm already created](white-label-multi-tenant-iot-platform).
- For SSO/AD: access to your identity provider (Microsoft Entra ID/AD, Google, Okta, or any OIDC/SAML IdP).

## Step 1 - Understand the access model

OpenRemote separates concerns into:

- **Realms** - isolated tenants (see the [white-label tutorial](white-label-multi-tenant-iot-platform)).
- **Roles** - what a user can do (read, write, configure, manage users, etc.).
- **Restricted users** - users who can only see the specific assets linked to them (device- or customer-level access control).

## Step 2 - Create roles and assign users

1. Go to the **Users** page in your realm.
2. Create users and assign **roles** appropriate to their job (for example a read-only "viewer" vs a "configurator").
3. For end customers who should only see their own equipment, mark them **restricted** and link the relevant assets to them. Also add the configuration item 'restricted access read/write' to the attributes you want the restricted user to see.

## Step 3 - Enable single sign-on (SSO)

Because identity is managed by Keycloak, you can federate to an external Identity Provider:

1. Open the Keycloak admin console for your realm.
2. Add an **Identity Provider** (OIDC or SAML) for your IdP and map claims/roles.
3. Users now sign in with corporate credentials; access maps to OpenRemote roles automatically.

To synchronise users/groups from a directory, follow [Linking to Active Directory](../user-guide/identity-and-security/linking-to-active-directory).

## Step 4 - Create OAuth2 service users for devices and integrations

For headless access (a device, a backend service, a CI job) create a **service user**:

1. On the **Users** page, add a **service user** (e.g. `integration-svc`).
2. Grant it the minimum roles it needs (prefer least privilege over the convenience of full read/write).
3. Use its client ID/secret with standard **OAuth 2.0** to obtain tokens for the REST, WebSocket or MQTT APIs.

:::caution
Give each device or integration its own service user with a narrow role, so you can revoke one without affecting the rest.
:::

## Step 5 - Verify

1. Sign in via your IdP and confirm the SSO flow and resulting roles.
2. Log in as a restricted user and confirm they see only their linked assets.
3. Obtain a token for the service user and call a [REST API](../category/rest-api) endpoint.

## Next steps

- Use these service users in the [MQTT/auto-provisioning](auto-provision-devices-at-scale) flow.
- Apply per-tenant branding in the [white-label, multi-tenant tutorial](white-label-multi-tenant-iot-platform).
