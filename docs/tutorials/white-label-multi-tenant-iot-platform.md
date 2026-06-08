# White-label your IoT platform with multi-tenant realms

This tutorial shows how to turn OpenRemote into a **white-label, multi-tenant IoT platform**: you will brand the Manager with your own logo and colours, give each customer (or distributor) their own isolated **realm**, and optionally serve it on a custom domain. This is exactly what device manufacturers (OEMs) and system integrators need when they want to resell an IoT solution under their own brand.

:::tip Why this matters for OEMs and integrators
White-labeling and multi-tenancy are part of the open-source core of OpenRemote — there is no separate "enterprise" edition or paid add-on to unlock branding, custom realms or role-based access. You can ship a fully branded, multi-customer platform without a per-feature licence.
:::

## Prerequisites

- A running OpenRemote instance — see the [Quick Start](https://docs.openremote.io/docs/quick-start).
- Superuser (`admin`) access to the **master** realm.
- Your brand assets: a `logo.png`, a `logo-mobile.png`, a `favicon.png`, and your brand colour hex codes.

## Step 1 — Create a realm per customer

Realms are OpenRemote's tenancy boundary: each realm has its own users, assets, agents, rules and branding, fully isolated from the others.

1. Log in as `admin` and open the **Realms** page from the top-right menu.
2. Click the **+** to add a realm, e.g. `acme`, give it a friendly display name (`ACME Buildings`) and enable it.
3. Repeat for each customer or distributor you want to onboard.

:::note
The `master` realm is for platform administration. Keep your customers in their own realms so a tenant can never see another tenant's data.
:::

## Step 2 — Brand the Manager (Appearance settings)

You can brand each realm independently from the UI.

1. Switch to the realm you want to brand (realm picker, top-right).
2. Go to **Settings → Appearance**.
3. Upload your **logo**, **mobile logo** and **favicon**, set the **app title** (e.g. `ACME IoT`), and configure the colour variables to match your brand.
4. Configure map defaults, navigation items and default language for that realm.

For a fully reproducible, version-controlled setup, define the same values in a `manager_config.json` instead:

```json
{
  "realms": {
    "acme": {
      "appTitle": "ACME IoT",
      "logo": "/images/acme-logo.png",
      "logoMobile": "/images/acme-logo-mobile.png",
      "favicon": "/images/acme-favicon.png",
      "styles": ":host > * {--or-app-color2: #F9F9F9; --or-app-color3: #22211f; --or-app-color4: #1b5630; --or-app-color5: #CCCCCC;}"
    }
  }
}
```

:::caution
The `admin` superuser is intentionally **not** restricted by `manager_config.json`, so branding changes may not be visible to `admin`. Log in as a normal realm user (or set `"manager": {"applyConfigToAdmin": true}`) to verify your branding.
:::

See [Custom deployment](https://docs.openremote.io/docs/user-guide/deploying/custom-deployment) and the [Appearance page](https://docs.openremote.io/docs/user-guide/manager-ui/appearance) for the full set of options.

## Step 3 — Serve each tenant on its own domain (optional)

Point your customer's domain (e.g. `iot.acme.com`) at the Docker host running the OpenRemote stack and set the `OR_HOSTNAME`/proxy configuration. The built-in HAProxy-based reverse proxy provisions TLS/SSL automatically (Let's Encrypt), so each branded tenant is served securely over HTTPS without extra tooling.

## Step 4 — Verify isolation

1. Create a test user in the `acme` realm and log in as that user in a separate browser session.
2. Confirm the branded login page, logo and colours appear.
3. Confirm the user can only see `acme` assets — not those of other realms.

## Next steps

- Lock down who can see what with [enterprise identity, SSO and RBAC](./enterprise-identity-sso-rbac).
- Let your customers' devices register themselves with [auto-provisioning at scale](./auto-provision-devices-at-scale).
- Build a customer-facing dashboard with the Insights dashboard builder.
