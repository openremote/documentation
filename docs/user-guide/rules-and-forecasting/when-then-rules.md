---
sidebar_position: 2
---

# When-Then Rules

When-Then rules are used in combination with the or-rules UI component. They are meant to be used to allow application users to define 'When this, then that' statements. For example "During weekdays, when it's cold, turn on the lights 5 minutes before sunset" or "send push notification to anybody who reaches the stadium".

Note that When-Then rules also support web hooks as the right hand side action. This allows you to connect to any other application based on an event. Options are endless, from connecting to your Maintenance or Messaging service to your ERP or CRM system.

![Manager Rules Editor](https://user-images.githubusercontent.com/11444149/191290260-f64c619b-e595-4bf0-8235-e9ef21923544.png)

## Guide to setting up your first When-Then rule
To get familiar with the When-Then interface we will be creating a rule that turns on lights when the temperature drops below a certain threshold and just before sunset (makes sense right?). We only want this rule to be active on weekdays.
This guide assumes you are using the [Demo](https://openremote.io/demo/). Otherwise you need to create some assets first.

1. Switch from the `master` realm to the `Smart city` realm in the top. You will see the assets we use a demo setup. 
2. Navigate to the `Rules` page, here you will find some demo rules that are running at the moment. We will add our own.
3. Add a new rule:
   * Click the `+`.
   * Select 'When-Then'.
   * Name it `Cold and sunset: lights on`.
4. Create the When side of the rule:
   * Click the `+`, a list of asset types will appear.
   * Select `Weather Asset`, the next will appear showing `Any of this type`.
   * Switch to the asset named `Weather`.
   * In the next field select the attribute of interest: `temperature`.
   * In the next field select the operator: `less than`.
   * Finally set a value of `10`. You have now finished the first condition. This can be combined through `AND` or `OR` with other conditions.
5. Create a second condition to monitor the humidity:
   * Click the `+` in the section below where it says `ADD CONDITION` and select `Time`.
   * Select Trigger Type `Sunset`.
   * Set the value `-5` for the `Offset in minutes`.
   * Select: `location`. You have finished the `AND` condition. If both conditions are met, the `Then` actions will trigger.
6. Create an action on the `Then` side of the rule:
   * Click the `+` on the right in the `Then` section.
   * Select the `Light Asset` asset type.
   * Select the lights that you want to control. In this case we want to turn on all lights at once using the `Lighting Noordereiland`.
   * Select the attribute you want to control: `On Off`.
   * Toggle the switch on. The Actions are done.
7. Set the schedule for this rule:
   * Open up the scheduler by clicking `Always active` next to the rules name.
   * Select `Plan a repeating occurrence` as we want the rule to work only on weekdays.
   * At `Repeat occurrence every` click the five `weekdays`
   * Leave the `Repetition ends` at `Never`
   * Click `Apply` and save the rule in the top right.

Your rule is finished! Every weekday the rule will check if both conditions are met and if so, turns on the lights of Noordereiland. 

## See Also

- [Create Rules](create-rules.md)
- [Manager UI](../manager-ui/manager-ui.md)
