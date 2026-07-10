# Extensions

Extensions are a way to add project-specific or domain-specific functionality without adding that functionality directly to the OpenRemote core.

An extension is packaged as a separate Java artifact and can provide additional capabilities such as protocol agents, asset types, setup tasks, container services, rules, or other reusable backend logic.

Extensions help keep the OpenRemote core smaller and easier to maintain.
They also make it easier to reuse functionality across multiple custom projects.

## Using extensions

Currently, extensions are used by adding them as dependencies to a custom project.

For example, the ENTSO-E extension can be added to the [dependencies block](https://github.com/openremote/custom-project/blob/d48cd93a21873e62df7fe5f79dce0624f3cfc972/manager/build.gradle#L3-L8) of the manager project in your custom project:

```groovy
dependencies {
    api "io.openremote.extension:openremote-entsoe-extension:0.5.1"
}
```

After the custom project is rebuilt and the OpenRemote Manager is restarted, the extension is available as part of that deployment.

For more details about the extension architecture and implementation approach, see the [extensions design document](https://github.com/openremote/extensions/pull/9).

## Current extensions

The current extensions are available in the [extensions repository](https://github.com/openremote/extensions/):

* [EMS](https://github.com/openremote/extensions/tree/main/ems): A new extension-based implementation of the Energy Management System with GOPACS support.
* [ENTSO-E](https://github.com/openremote/extensions/tree/main/entsoe/): Agent for retrieving ENTSO-E energy price data and storing it as predicted datapoints.

## Current status

The extension mechanism is currently build-time based.
This means extensions cannot yet be installed, enabled, or disabled dynamically from the Manager UI.

We are also working on moving more reusable and domain-specific code out of the main OpenRemote repository and into the [extensions repository](https://github.com/openremote/extensions/).
Over time, this should make the main repository leaner while making optional functionality easier to package, maintain, and reuse.

You can follow the ongoing work in the [extensions epic](https://github.com/openremote/openremote/issues/2598).
