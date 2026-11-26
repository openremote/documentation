# Configuration templates

A configuration template is a JSON file that holds the configuration items of the attributes of an asset.
Use it to set up similar assets the same way, within one instance or on another one, without entering every configuration item again.
You can find it on the Assets page: select an asset, click `Modify`, and use `Import` and `Export` in the header of the Attributes panel.

Configuration templates provide three capabilities:
- **Export**: save the configuration items of the selected attributes of an asset to a template file
- **Import**: apply a template file to another asset, after a preview of what will change
- **Parameters**: on import, pick the values that differ per asset, such as the **Agent ID** of an agent link

## Before you start

### What a template holds

A template holds the configuration of attributes, not their values:
- **Included**: the asset type the template was exported from, and the name, value type and configuration items of each selected attribute, such as `Label`, `Agent link`, `Constraints` or `Store data points`
- **Not included**: attribute values, the properties of the asset such as its name and parent, attributes that were added to the asset alone rather than defined by its asset type, the access configuration items (`Access public read`, `Access public write`, `Access restricted read` and `Access restricted write`) and `Attribute links`

Access configuration items and attribute links stay with each asset.
Export leaves them out and import keeps those of the asset you import into, so a template never grants access or links attributes to other assets.

:::warning Treat templates as sensitive

A template holds the configuration items exactly as the asset stores them, and the file is not encrypted.
Agent links can include credentials, such as API keys or tokens in the headers or query parameters of an HTTP agent link, and they show how your devices are connected.
Store template files securely and do not share them with untrusted people.

:::

### Where it is available

- `Import` and `Export` are not available on agents, as agents are configured through their attribute values.
- `Import` is disabled on a new asset until it is saved.
- `Export` is disabled while the asset has unsaved changes. Save or discard them first, as the template is built from the stored asset.

### Required roles

You can assign these roles on the [Roles](./10-manager-ui.md#roles) page:

| Role           | Description                                                                   |
| :------------- | :---------------------------------------------------------------------------- |
| `read:assets`  | Export a configuration template                                               |
| `write:assets` | Enter `Modify` mode, import a configuration template and save the asset after |

`Import` and `Export` are part of `Modify` mode, so exporting from the Manager UI also requires `write:assets`.
Through the [API](#using-the-api), `read:assets` is enough to export.

A [restricted user](../070-identity-and-security/10-realms-users-and-roles.md#restricted-user-realm-role) can only export and import on the assets they are linked to.
Their export only holds the attributes they can read, which are the attributes with `Access restricted read`.

## Exporting a configuration template

1. Select the asset on the Assets page and click `Modify`.
2. Click `Export` in the header of the Attributes panel.
3. Optionally change the **Template name**. It names the downloaded file and starts as `<asset name>-configuration-template.json`.
4. Select the attributes to include, or use **Select all**.
5. Click `Export`.

The browser downloads the template as a JSON file.
If the name you entered does not end with `.json`, the extension is added.

The dialog lists every attribute that the asset type defines and that holds at least one configuration item other than access and attribute links.
The number next to an attribute is the number of configuration items it exports.
Click the row of an attribute to see these items, and click `JSON` next to an item to see its full value.

If no attribute of the asset has configuration items to export, you will see the message `None of the attributes of this asset have configuration items to export` instead of the dialog.

## Importing a configuration template

An import never changes the stored asset by itself.
It applies the template to the asset as you are editing it, and you save or discard the result as with any other change.

1. Select the asset on the Assets page and click `Modify`.
2. Click `Import` in the header of the Attributes panel.
3. Click `Select file`, choose a template file, and click `Next`.
4. Check the preview: the **Matched attributes** are imported, and the attributes listed under **Attribute name or type not found** are skipped. See [How attributes are matched](#how-attributes-are-matched).
5. If the preview shows `Next`, click it, fill in the [parameters](#template-parameters) for the matched attributes, and click `Import`. Otherwise, click `Import` directly.
6. Check the imported configuration items in the Attributes panel and click `Save`.

Click `Back` to return to the previous step, or close the dialog to cancel the import without changing the asset.

:::warning

Import replaces all configuration items of each matched attribute with those in the template.
Configuration items that a matched attribute holds but the template does not are removed.
Only access configuration items and attribute links keep their current values.
Attributes that are not in the template are not changed.

When a [restricted user](../070-identity-and-security/10-realms-users-and-roles.md#restricted-user-realm-role) saves, only attributes with `Access restricted write` are updated, and their configuration items are added or replaced but never removed.
Imported changes to other attributes are not saved.

:::

### How attributes are matched

The template is checked against the asset as you are editing it, including unsaved changes.
An attribute of the template is imported when the asset has an attribute with exactly the same name and value type, and that attribute is defined by the asset type of the asset.

| Attribute of the template                                         | Result                             |
| :---------------------------------------------------------------- | :--------------------------------- |
| The asset has an attribute with the same name and value type      | Imported, listed as matched        |
| The asset has no attribute with this name                         | Skipped                            |
| The attribute of the asset has another value type                 | Skipped, the type is never changed |
| The attribute was added to the asset alone, not by its asset type | Skipped                            |

The asset type in the template does not have to match the asset you import into.
A template exported from one asset type can be imported into another asset type that shares attributes with it.
If no attribute can be imported, the import is rejected and the skipped attributes are listed.

### Template parameters

Some fields of an agent link differ per asset or per instance, such as the agent it links to.
These fields are template parameters: on import you confirm or replace their values before the template is applied.
Only the agent links of matched attributes have parameters, so the parameter step is left out when none of them holds an agent link.

| Parameter    | Agent links                                                                       | Input                                                                               |
| :----------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Agent ID** | All agent links                                                                   | Select an agent of the link's type in the current realm. Required                   |
| **Unit ID**  | [Modbus](../040-agents-protocols/080-modbus.md#linking-attributes-via-agent-link) | Enter the Modbus device address, at least `1`                                       |

The parameter step shows one section per agent link type, for example `Modbus Agent Link parameters`.
Each parameter starts with the value of the template, and lists the attributes it applies to.
Agent links of the same type that hold the same value share one parameter, so twenty attributes linked to the same agent ask for that agent once.
The value you enter is applied to the agent link of every attribute the parameter lists.
The agent link type itself is never a parameter, as it follows from the agent.

`Import` stays disabled until every parameter holds a valid value.
You may see these messages on the **Agent ID** input:

| Message                                                                                                 | Meaning                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `The template's agent does not exist here. Pick another one.`                                           | The agent of the template is not in this realm, for example because the template comes from another instance. Select an agent                                                      |
| `There is no agent for a <agent link type> yet. Add one to continue; this list updates once it exists.` | The realm has no agent of this link type. [Create the agent](./10-manager-ui.md#create-an-agent), for example in another browser tab. The list updates while the dialog stays open |

### When importing fails

If the template cannot be imported, you will see the reason and, where known, where in the file the problem is, such as `Attribute 'Dimmer', configuration item 'Constraints', parameter 'min'.`
Click `Back` to select another file, or `Close` to cancel the import.
The last two messages below only offer `Close`, as another file does not help.

| Message                                                                                 | Cause                                                                                                                                                                 |
| :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `The selected file does not hold valid JSON.`                                           | The file is not JSON, or does not hold a JSON object                                                                                                                  |
| `The selected file holds an unsupported configuration template version.`                | The `version` is not `1`                                                                                                                                              |
| `The selected file is missing a required field.`                                        | The `version`, `assetType` or `attributes` field is missing, or `assetType` is empty                                                                                  |
| `The selected file holds a malformed attribute entry.`                                  | An attribute entry does not hold a `type` and a `meta` object                                                                                                         |
| `The selected file holds a configuration item whose value does not fit its type.`       | A configuration item holds a value that does not fit its type or breaks its constraints. This includes an agent link of a type that is not available on this instance |
| `The current value of an attribute does not meet the constraints in the selected file.` | The constraints in the template would make the current value of an attribute invalid, so the asset could not be saved                                                 |
| `None of the attributes in the selected file can be imported into this asset.`          | No attribute matches by name and value type. See [How attributes are matched](#how-attributes-are-matched)                                                            |
| `This asset has changed since you opened it; refresh it and try again.`                 | The ID, realm or type of the asset you are editing no longer matches the stored asset. Reload the page and import again                                               |
| `You are not allowed to import a configuration template into this asset.`               | You lack the [required roles](#required-roles), or you are a restricted user who is not linked to the asset                                                           |

## Template file format

A template is a JSON document that you can also write or edit by hand.
The example below holds two attributes of a light, linked to a simulator agent:

```json
{
  "version": 1,
  "assetType": "LightAsset",
  "attributes": {
    "brightness": {
      "type": "positiveInteger",
      "meta": {
        "label": "Dimmer",
        "storeDataPoints": true,
        "agentLink": {
          "type": "SimulatorAgentLink",
          "id": "5Bg0XHJ9tZmTXrZs9KLy5c"
        }
      }
    },
    "onOff": {
      "type": "boolean",
      "meta": {
        "label": "Power",
        "ruleState": true
      }
    }
  }
}
```

| Field                     | Description                                                                                                                                                                  |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`                 | The format version. Must be `1`                                                                                                                                              |
| `assetType`               | The asset type the template was exported from. Required, but not used to match attributes                                                                                    |
| `attributes`              | The attribute configuration, keyed by attribute name. Export sorts the attributes by name                                                                                    |
| `attributes.<name>.type`  | The value type of the attribute, such as `number`, `positiveInteger`, `boolean` or `text`. See [Value descriptors](../030-assets-agents-and-attributes.md#value-descriptors) |
| `attributes.<name>.meta`  | The configuration items of the attribute, keyed by their name, as the asset stores them. See [Configure attributes](./10-manager-ui.md#configure-attributes)                 |

Each configuration item is checked when you import the file, in the same way as when you save an asset.
Access configuration items and attribute links in a file are ignored on import.

## Examples

The examples below show how to use configuration templates in common situations.
See [Exporting a configuration template](#exporting-a-configuration-template) and [Importing a configuration template](#importing-a-configuration-template) for all steps.

### Set up similar assets the same way

You have configured one pump with labels, units, constraints, data point storage and agent links, and want ten more pumps to behave the same.

1. Configure and save the first pump.
2. Open it in `Modify` mode, click `Export`, keep all attributes selected, and click `Export`.
3. Open the next pump in `Modify` mode, click `Import`, select the downloaded file and click `Next`.
4. Check that all attributes are matched, and continue.
5. For each **Agent ID**, select the agent of this pump, then click `Import` and `Save`.

Repeat steps 3 to 5 for each pump.
If all pumps share one agent, the template's agent is already selected and you only need to confirm it.

### Move a configuration to another instance

The agents of another instance have different IDs than those in a template, so each agent link asks for a new agent.

1. On the other instance, first create the agents that the assets link to, such as a Modbus agent.
2. Create and save the asset, then open it in `Modify` mode and import the template.
3. In the parameter step, you will see `The template's agent does not exist here. Pick another one.` Select the agent you created.
4. For Modbus agent links, check the **Unit ID** of each device.
5. Click `Import` and `Save`.

If the instance has no agent of a needed type yet, you can create it in another browser tab while the dialog stays open.
The agent becomes available in the list once it exists.

### Copy only some attributes

1. Click `Export`, clear **Select all**, and select only the attributes to include, for example only those with an agent link.
2. Click `Export`.

When you import this template, attributes that are not in it keep their configuration.

## Using the API

You can also export and import configuration templates through the HTTP API, for example to set up many assets from a script.
Both endpoints are on the asset resource, and export does not require `write:assets` as it does in the Manager UI:

| Operation                    | Endpoint                                                         | Required role  |
| :--------------------------- | :--------------------------------------------------------------- | :------------- |
| Export a template            | `GET /api/{realm}/asset/{assetId}/configurationTemplate`         | `read:assets`  |
| Preview a template import    | `POST /api/{realm}/asset/{assetId}/configurationTemplate/import` | `write:assets` |

Without `attributeName`, export returns all exportable attributes.
Repeat the `attributeName` query parameter to export only those attributes.
It returns `400` if there is nothing to export.

The import endpoint takes the asset as you are editing it as `draft` and the template file contents as text in `document`.
It returns what the import would do, with the skipped attributes and the patched attributes of the draft, and stores nothing.
To import, apply the returned `patchedAttributes` to the asset and save it with the [asset update endpoint](../../rest-api/update-asset.api.mdx).
A template that cannot be imported returns `400` with the reason in `failure` and, where known, its place in `failureLocation`.
A draft that no longer matches the stored asset returns `409`.
Template parameters are not resolved by the API, so set agent IDs and other parameters in the patched attributes yourself.

For authentication, see [Manager APIs](../050-manager-apis.md).

## See Also

- [Manager UI: Configure attributes](./10-manager-ui.md#configure-attributes)
- [Assets, agents and attributes: Configuration items](../030-assets-agents-and-attributes.md#configuration-items)
- [Agents and protocols: Agent links](../040-agents-protocols/010-overview.md#agent-links)
- [Modbus: Linking attributes via agent link](../040-agents-protocols/080-modbus.md#linking-attributes-via-agent-link)
- [Realms, users and roles](../070-identity-and-security/10-realms-users-and-roles.md)
