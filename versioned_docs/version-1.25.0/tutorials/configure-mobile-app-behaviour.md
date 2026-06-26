---
sidebar_position: 5
---

# Configure mobile app behaviour

Here we will explain how to configure your apps to be used in the OpenRemote mobile app.

Mobile apps can be found in the 
[Apple App Store](https://apps.apple.com/nl/app/openremote-app/id1526315885?mt=8) and on [Google Play](https://play.google.com/store/apps/details?id=io.openremote.app&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1).  

The first time opening the app you will be asked (up to) three things: 'App Domain', 'Select an app' and 'Enter the Realm'. Switching between domains, apps and realms can be done by long-pressing the app icon on your home screen. If you are hosting an OpenRemote instance at https://yourhost.com use the following: 'App Domain' is 'yourhost.com'.  

Several configuration options allow to influence this flow, these are described below.

The more advanced configuration options are done via the `console_config.json` file, which is located in the `/deployment/manager/app` folder.  
This file has the following structure
```json
{
    "showAppTextInput" : true | false, // Show app text input instead of drop down (user must correctly enter app name)
    "showRealmTextInput" : true | false, // Show realm text input instead of drop down (user must correctly enter realm name)
    "app" : null, // App name, load that specific app (don't allow choice)
    "allowedApps" : [], // List of allowed apps (ignore apps that are actually available and use this list instead)
    "apps" : {
        "<APP_NAME>" or "default" : {
            "consoleAppIncompatible" : true | false, // If set to true don't show in list
            "realms" : [], // List of realms that can be used with this app
            "providers" : [], // List of console providers the app wants to/should use
            "description" : "" // Description of the app
        }
    } 
}
```

## Domain

The domain must always be manually entered by the user. Users can enter:
- a full URL (e.g. https://myapp.example.com), with optional port
- a fully qualified host name (e.g. myapp.example.com), https in used as the scheme
- an IP address, with or without scheme (e.g. 192.168.1.1)
- a simple domain (string with no dot in name), the URL used is then https://_domain_.openremote.app

## App

By default, the system discovers the available apps and presents them to the user as a list for selection.  
If there's only one available app, it's automatically selected and no option is presented to the user.

### Configure apps which can be selected

Apps can be hidden from the consoles using one of the following methods:
- Either placing an empty `.appignore` file in the folder of the platform- or custom app.  
For example: `/ui/app/custom/.appignore`

- Or, customizing the `console_config.json` file.  
The `allowedApps` field allows you to customize the list of apps that can be selected in consoles.  
For example: `{ allowedApps: ['manager', 'custom'] }`

- Or, customizing the `console_config.json` file.  
Setting the `consoleAppIncompatible` to `true` for an application will prevent it from being presented or selected in the console.  

Both of these options only impact the consoles, the URLs are still available on the web.  

Again, if the filtered list only contains one app, it's automatically selected and no option is presented to the user.

### Force app name entry

If you don't want the console to present a list of available apps, you can force the user to manually enter the app name in a text field.  
Customize the `console_config.json` file, setting the `showAppTextInput` to `true`.  

The app name entered by the user must still be a valid app name  
i.e. if the `allowedApps` field has been defined, the entered app name must be present in that list.  
In this case, even if only one application is available, it is not automatically selected.

### Pre-define selected app

You can also specify the app to be used and forbid selection by the user (the app selection option is never presented).  
Customize the `console_config.json` file, setting the `app` field to the name of the app you want to be used.

## Realm

As for apps, by default, the console presents the user with a list of possible realms for selection.  
If there's only one available realm, it's automatically selected and no option is presented to the user.

### Configure for which realms the app can be used

To define the realms allowed for a specific app, customize the `console_config.json` file.  
Under the given app section, list the realms names in the `realms` property.  
For example
```json
{
    "apps" : {
        "console1" : {
            "realms" : [ "master", "realm2"]
        }
    } 
}
```

### Force realm name entry

If you don't want the console to present a list of available realms, you can force the user to manually enter the realm name in a text field.  
Customize the `console_config.json` file, setting the `showRealmTextInput` to `true`.  

## Providers

For example
```json
{
    "apps" : {
        "console1" : {
            "providers" : [ "push", "storage"]
        }
    } 
}
```

## See Also
- [Consoles](../user-guide/manager-ui/on-mobile.md)
- [Working on the mobile consoles](../developer-guide/working-on-the-mobile-consoles.md)
- [Architecture: Apps and consoles](../architecture/apps-and-consoles.md)
