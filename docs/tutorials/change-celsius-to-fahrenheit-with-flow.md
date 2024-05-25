---
sidebar_position: 4
---

# Celsius to Fahrenheit with Flow

An example for converting an attribute value, using the Flow editor is the conversion from temperature Celsius into Fahrenheit.

First of all create the attribute you want to show the temperature in Fahrenheit. Note that you have to add the configuration item “Rule state” to be able to use it in the flow editor. In the example we also:

* added a new name (using the configuration item ‘Label’)
* set it to “Read only” (so you can’t write a new number on the asset page)
* selected “Store data points” (so you can look back at historical values)
* added the unit Fahrenheit

<kbd>![Add Fahrenheit attribute](https://github.com/openremote/Documentation/blob/master/manuscript/figures/Flow%20-%20New%20attribute%20for%20flow.png)</kbd>

Next create a flow in the flow editor, which looks like this:

<kbd>![Flow from Celsius to Fahrenheit](https://github.com/openremote/Documentation/blob/master/manuscript/figures/Flow%20-%20Celcius%20to%20Fahrenheit.png)</kbd>

You will now have the second temperature in Fahrenheit filled once the temperature in Celcius updates. It will look like this.

<kbd>![Fahrenheit attribute as filled by the flow](https://github.com/openremote/Documentation/blob/master/manuscript/figures/Flow%20-%20the%20Fahrenheit%20result.png)</kbd>
