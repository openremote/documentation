---
sidebar_position: 5
---

# Configure mobile app behaviour

T.B.D.

Here we will explain how to configure your apps to be used in the OpenRemote mobile app. You have the option to show/not show on mobile, and for which realms the app is available. Also you can define whether realm options are shown as a list or input field (if you don't want to reveal all available realms).

Mobile apps can be found in the 
[Apple Appstore](https://apps.apple.com/nl/app/openremote-app/id1526315885?mt=8) and [Google Playstore](https://play.google.com/store/apps/details?id=io.openremote.app&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1)

The first time opening the app you will be asked three things: 'App Domain', 'Select an app' and 'Enter the Realm'. Switching between domains, apps and realms can be done by long-pressing the app icon on your home screen. If you are hosting an OpenRemote instance at https://yourhost.com use the following: 'App Domain' is 'yourhost.com'.<br />
<br />

## Configure apps which can be selected

Apps can be hidden from the consoles using one of the following methods:
- Either placing an empty `.appignore` file in the folder of the platform- or custom app.<br />
For example: `/ui/app/custom/.appignore`

- Or, customizing the `console_config.json` file, which is located in the `/deployment/manager/app` folder.<br />
The `allowedApps` field allows you to customize the list of apps that is visible in consoles. <br />
For example: `{ allowedApps: ['manager', 'custom'] }`

Both of these options only impact the consoles, the URLs are still available on the web.<br />
If during use only one App is present, the consoles will automatically skip the 'app selection'-menu, and go straight to the app.<br />
<br />

## Configure for which realms the app can be used

T.B.D.
- shortlist available realms
- show as dropdown list or input field
- if only one realm, skip step

## See Also
- [Consoles](../user-guide/manager-ui/on-mobile.md)
- [Working on the mobile consoles](../developer-guide/working-on-the-mobile-consoles.md)
- [Architecture: Apps and consoles](../architecture/apps-and-consoles.md)
