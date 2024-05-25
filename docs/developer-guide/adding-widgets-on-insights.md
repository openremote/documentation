---
sidebar_position: 10
---

# Adding Widgets on Insights

## Manager UI
The Insights page allows you to create multiple dashboards within the Manager UI.<br />
Using widgets you are able to customize what data to visualize, and how it should appear on the dashboard.<br />
Currently we have several built-in widgets available:<br />
<br />

| Widget | Description
|---|---|
|![image](https://github.com/openremote/openremote/assets/27913110/b0ee048a-998b-4fd7-b557-c41366fa965a)| An attribute field with the ability to edit its value within the dashboard itself.<br /> It works similar to the asset page, where the control changes depending on the attribute type. |
|![image](https://github.com/openremote/openremote/assets/27913110/143f1148-40bb-4612-9719-c820dff22e46)| Measuring instrument to compare the current value of an attribute with some predefined thresholds. |
|![image](https://github.com/openremote/openremote/assets/27913110/16a1a783-ada3-402f-b304-cfdbee6f4994)| Background image with attribute value labels that can be placed anywhere. |
|![image](https://github.com/openremote/openremote/assets/27913110/d19d9352-d31a-4cdf-9598-8a14f260ca42)| Displays the current value of an attribute, and shows the trend in a chart. |
|![image](https://github.com/openremote/openremote/assets/27913110/a8036ec9-7c24-4a20-ad53-94ba801aa26c)| Chart with history and/or predicted data of unlimited attributes.<br />Uses data decimation algorithms, and supports multi-axis. |
|![image](https://github.com/openremote/openremote/assets/27913110/c4c2ac19-d0ba-497a-af32-073b23d9d79c)| Map with locations of all assets that correspond with the selected asset type.<br />Optionally it can show a color based on thresholds, or a label with the current value of an attribute. |
|![image](https://github.com/openremote/openremote/assets/27913110/81978397-f8cc-4774-b8ff-60536560e8e5)| Table showing multiple attribute values of the assets you select.<br /> It is very useful for gaining insights in a larger number of assets with a single look. |


We might add more widgets over time, so this list can become longer.<br />
Feel free to develop new widgets yourself; there is functionality to create them with ease.<br />
<br />

## Building custom widgets

The widget architecture is structured to support the additions of custom widgets, whereof a short tutorial is shown below.<br />
To know more about the dashboard builder and it's terminology, check the README of the `or-dashboard-builder` component.<br />
<br />
All widget code is located under `/ui/components/or-dashboard-builder/widgets/`.<br />
<br />

> **Working in a OpenRemote custom project?**<br />
> Unfortunately this is very tricky, since all widget code is located in the `or-dashboard-builder` component,<br />
> but not linked to a class at all. You might need to apply inheritance to make it work for custom projects.<br />
> Take a look at the codebase and check the `registerWidgetTypes()` method, and references to the `widgetTypes` object.<br />
> We want to improve this in the future.<br />
<br />

### Creating your own Widget

All widget code is located under `/ui/components/or-dashboard-builder/widgets/`.<br />
Create a new TypeScript file, and define a `WidgetManifest` to set up your widget.<br />
It includes options like its display name, minimum width of columns, and a reference to the HTML content.<br />
You can write the HTML/CSS code in the same file, or reference it from somewhere else. See the example below.<br />
<br />
Before continuing, you are required register the widget.<br />
This can be done by adding a link to the manifest in the `registerWidgetTypes()` function in the `index.ts` file.<br />
It will add your widget to the 'widget browser', and handle all functions automatically.
```typescript
export function registerWidgetTypes() {
    widgetTypes.set("linechart", ChartWidget.getManifest());
    widgetTypes.set("gauge", GaugeWidget.getManifest());
    ...
    // add here
}
```

From there, you can add your custom class to the `/widgets` folder and build your HTMLElements.<br />
It is **required** to inherit from `or-widget`, *(or an extended class of it such as or-asset-widget)*<br />
and your custom config is **required** to extend on `WidgetConfig`<br />
<br />


#### Example of a custom Widget

Here is a code example of how to create custom widgets. Feel free to copy, and adjust it to your needs.<br />
Looking into our existing widgets also helps understanding the codebase.

```typescript
export interface CustomWidgetConfig extends WidgetConfig {
    attributeRefs: AttributeRef[];
    customFieldOne: string;
    customFieldTwo: number;
}

function getDefaultWidgetConfig(): CustomWidgetConfig {
    return {
        attributeRefs: [],
        customFieldOne: "default text",
        customFieldTwo: 0
    };
}

@customElement("custom-widget")
export class CustomWidget extends OrWidget {

    // Override of widgetConfig with extended type
    protected readonly widgetConfig!: CustomWidgetConfig;

    static getManifest(): WidgetManifest {
        return {
            displayName: "Custom widget", // name to display in widget browser
            displayIcon: "gauge", // icon to display in widget browser. Uses <or-icon> and https://materialdesignicons.com
            minColumnWidth: 1,
            minColumnHeight: 1,
            getContentHtml(config: CustomWidgetConfig): OrWidget {
                return new CustomWidget(config);
            },
            getSettingsHtml(config: CustomWidgetConfig): WidgetSettings {
                return new CustomSettings(config);
            },
            getDefaultConfig(): CustomWidgetConfig {
                return getDefaultWidgetConfig();
            }
        }
    }

    public refreshContent(force: boolean) {
        // function that executes on refresh of the widget.
        // It's normally a 'silent' function that, for example, fetches the data of assets again.
    }

    protected render(): TemplateResult {
        return html`
            <span>Custom field one: </span>
            <span>${this.widgetConfig.customFieldOne}</span>
        `;
    }

}

// Settings element
// This can be placed in a seperate file if preferred.
@customElement("custom-settings")
export class CustomSettings extends WidgetSettings {

    // Override of widgetConfig with extended type
    protected readonly widgetConfig!: CustomWidgetConfig;

    protected render(): TemplateResult {
        return html`
            <span>Custom settings</span>
            <button @click="${() => this.onButtonClick()}">Click to customize text</button>
        `;
    }

    protected onButtonClick() {
        this.widgetConfig.customFieldOne = "custom text";
        this.notifyConfigUpdate();
    }
}

```
