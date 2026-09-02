# Celsius to Fahrenheit with Flow

This tutorial offers an example for converting an attribute value, using the Flow editor. This example describes the conversion from temperature Celsius into Fahrenheit.

## Prerequisites

- A running OpenRemote instance - see the [Quick Start](../quick-start).

## Step 1 - Create a new attribute

First of all create the attribute you want to show the temperature in Fahrenheit. Note that you have to add the configuration item “Rule state” to be able to use it in the flow editor. In the example we also:

* added a new name (using the configuration item ‘Label’)
* set it to “Read only” (so you can’t write a new number on the asset page)
* selected “Store data points” (so you can look back at historical values)
* added the unit Fahrenheit

![Add Fahrenheit attribute](img/flow-new-attribute-for-flow.png)

## Step 2 - Create the flow rule

Next create a flow in the flow editor, which looks like this:

![Flow from Celsius to Fahrenheit](img/flow-celsius-to-fahrenheit.png)

You will now have the second temperature in Fahrenheit filled once the temperature in Celsius updates. It will look like this.

![Fahrenheit attribute as filled by the flow](img/flow-the-fahrenheit-result.png)
