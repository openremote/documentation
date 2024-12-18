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
|![image](img/attribute-widget.png)| An attribute field with the ability to edit its value within the dashboard itself.<br /> It works similar to the asset page, where the control changes depending on the attribute type. |
|![image](img/gauge-widget.png)| Measuring instrument to compare the current value of an attribute with some predefined thresholds. |
|![image](img/image-widget.png)| Background image with attribute value labels that can be placed anywhere. |
|![image](img/kpi-widget.png)| Displays the current value of an attribute, and shows the trend in a chart. |
|![image](img/line-chart-widget.png)| Chart with history and/or predicted data of unlimited attributes.<br />Uses data decimation algorithms, and supports multi-axis. |
|![image](img/map-widget.png)| Map with locations of all assets that correspond with the selected asset type.<br />Optionally it can show a color based on thresholds, or a label with the current value of an attribute. |
|![image](img/table-widget.png)| Table showing multiple attribute values of the assets you select.<br /> It is very useful for gaining insights in a larger number of assets with a single look. |


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
