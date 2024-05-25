---
sidebar_position: 2
---

# On mobile

The OpenRemote Manager including the Insights dashboards, are responsive and can be used on mobile devices. We have an OpenRemote app in the Apple and Google stores which can be used as well. To make use of the services of mobile devices (e.g. location service and push notifications) you have to build your own app, using the project source code.

![Creating dashboard apps OpenRemote](https://github.com/openremote/openremote/assets/11444149/bcd2dd9e-624f-425a-b5a9-74e76b3da068)

## OpenRemote iOS and Android App

OpenRemote includes consoles for iOS and Android. The current apps we are hosting on the [Appstore](https://apps.apple.com/nl/app/openremote-app/id1526315885?mt=8) and [Google Play Store](https://play.google.com/store/apps/details?id=io.openremote.app&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1), can connect to your OpenRemote Manager instance. To use these apps for your own OpenRemote installation follow these three steps

1. By default you can view two types of apps for your OpenRemote instance, the 'manager' app and the 'insights' app. The 'manager' app will display all Manager pages, except the 'rules'. The 'insights' page will only show the dashboards created on the Insights page. Basically it allows you to create a simple standalone dashboard app for your users.
 
2. Before [deploying OpenRemote](../deploying/custom-deployment.md), you have the possibility to define which apps are ignored for the consoles. Apps reside in [the ui/app folder](https://github.com/openremote/openremote/tree/master/ui/app). By adding an empty `.appignore` file (like in the 'swagger' and 'console_loader' folders), these apps get ignored.

3. Once OpenRemote is deployed and you open the app the first time the app asks for 'App Domain', 'Select an app' and 'Enter the Realm'. If you are e.g. hosting an OpenRemote instance and Realm at https://yourhost.com/manager/?realm=yourrealm use the following: 'App Domain' is 'yourhost.com', App is 'manager' or 'insights' and 'Realm' is 'yourrealm'. Switching between domains, apps and realms can be done by long-pressing the app icon on your home screen.

## Using the mobile apps on OpenRemote hosted environments

You also can use the app for domains hosted by OpenRemote, e.g. the demo environment:

![](https://user-images.githubusercontent.com/11444149/231217369-fa5480c4-555d-400f-959a-29c704a3794c.png)
_Use the OpenRemote app on the Appstore and Google Play Store to access the demo and try out rules with push notification. Passwords are identical to the Realm names. Note that you have to create the rules while logged in on desktop._

Once you come to the login page, you are accessing the Manager UI or Insights dashboards and seeing the mobile version. Switching between domains, apps and realms can be done by long-pressing the app icon on your home screen.

## Building your own mobile apps

As part of building your own app, using our library of web components, you can use the OpenRemote consoles to leverage functionality of mobile devices, e.g. enable push notifications, use the build in QR reader, or use geofences. Check out the links below and the code itself if you want to know more. 

## See Also
- [Working on the mobile consoles](../../developer-guide/working-on-the-mobile-consoles.md)
- [Architecture: Apps and consoles](../../architecture/apps-and-consoles.md)
- [Configure the mobile app behaviour](../../tutorials/configure-mobile-app-behaviour.md)
