---
sidebar_position: 3
---

# Apps and consoles

## Terminology
### App (Client)
A frontend application that optionally consumes the OR APIs; same meaning as OAuth client (The OR Manager web application is a client; for custom projects there could be zero or more apps where each app may be used across one or more realms, the apps generally provide very specific functionality as required by the project). These are generally responsive web applications.

### Console
This is the application used to load the client and can be thought of as a wrapper around a client e.g. Web Browser, Android/iOS App. Generally this is an application capable of loading a web view that renders the client. A console could be hardcoded to a specific realm and client or it could be more configurable depending on requirements. A web browser requires no installation where as Android/iOS consoles are pre-compiled and distributed.

## Console/app interaction
Apps and consoles exchange information using the API described below which consists of `providers`, a `provider` is a piece of functionality that the console provides to the app, messages can be sent bidirectionally between the console and app. The Android and iOS consoles implement a standard mechanism for this communication and when running an app in the Web Browser the `@openremote/core` component handles communication and also implements a limited subset of `providers` (e.g. `push`). The console is accessed via the `console` property on the `@openremote/core` component but it is also exported globally as `OpenRemoteConsole`:
```
import openremote from "@openremote/core";
openremote.init(...).then(()=> {
   let console1 = openremote.console;
   let console2 = window.OpenRemoteConsole;
   console.log("Consoles are the same: " + console1 == console2);
});
```

## Build and deployment
Apps should be built and deployed within the OR manager web server using the standard tooling e.g. `gradle clean installDist` (refer to the developer guide).
Console build and deployment will depend on the specific tools and platform used but where possible the standard tooling and deployment process should be used.

## Runtime behaviour
1. Console is 'launched' (e.g. typing URL in browser or opening the app)
1. Console then displays a splash screen indicating that the client is loading
1. App is loaded and the URL should include query parameters to instruct the `@openremote/core` component what functionality they wish to provide to the client (see the Console/app API below)
1. The app will initialise the console and the console must reply to the app as required by the API (see the Console/app API below)
1. If the app has set `consoleAutoEnable: false` when initialising the `@openremote/core` component then the console must listen for the `OREvent.CONSOLE_INIT` event and then it can enable each `provider` that it is providing to the app; once all `providers` are enabled (excluding those that have been explicitly `disabled` by the user or some other mechanism) then the `OREvent.CONSOLE_READY` event is raised

Once the console is ready it is automatically registered with the manager backend by sending a `ConsoleRegistration` object, for example:
```
{
   name: "ExampleConsole",
   version: "1.0.0",
   platform: "Android 7.1.2",
   providers: {
      push: {
         version: "ORConsole",
         requiresPermission: true,
         hasPermission: true,
         enabled: true,
         disabled: false,
         data: {
            token: "323daf3434098fabcbc",
            topics: ["update", "maintenance"]
         }
      },
      geofence: {
         version: "ORConsole",
         requiresPermission: true,
         hasPermission: true,
         enabled: true
         disabled: false
      }
   }
}
```
If registration is successful then the server will return the saved console registration (including the id); which should be stored for future registration requests.

**N.B. the console registration is converted into an asset which is stored on the server inside the appropriate realm under an asset called 'Consoles' and if the client is authenticated then the console asset is linked with the authenticated user**

When the app specifies `consoleAutoEnable: false` then it is responsible for enabling each `provider` which allows the app to do things like wait until a user requests functionality provided by a provider before enabling it. When a providers status changes the `@openremote/core` component will automatically update the console registration on the server.

## App/console API
### Client URL
Console loads app with the following query parameters in the URL to override desired functionality and to inform the client about itself (ones in bold are required):

* **consoleName[string]** - Name of the console
* **consoleVersion [string]** - Version of the console
* **consolePlatform [string]** - Name of the platform
* consoleProviders [string] - Space delimited list of providers that this console supports (see below for currently supported/standard providers)
* consoleAutoEnable [boolean] - Whether `@openremote/core` should try and auto enable each provider (note that auto enabling cannot send any custom data to each provider during enabling and it also cannot do any processing on the responses received), for this reason it only really works on providers that don't require data during enabling.

#### Initialise
For each provider the `@openremote/core` component sends a message asking the console to initialise the provider:
```
{
   action: "PROVIDER_INIT",
   provider: "PROVIDER_NAME"
}
```
The console then does any required initialisation and sends a message back to the app:
```
{
   action: "PROVIDER_INIT",
   provider: "PROVIDER_NAME",
   version: "PROVIDER_VERSION",
   enabled: true|false [tells the app whether the provider is already enabled and therefore doesn't require enabling]
   disabled: true|false [tells the app whether the provider was previously disabled and therefore shouldn't be enabled]
   requiresPermission: true|false [tells the app whether user permission is required for this provider]
   hasPermission: true|false|null [tells the app whether permission has already been granted true=permission granted; false=permission denied; null=permission not yet requested]
   success: true|false [true=init success; false=init failure]
}
```
If a provider initialisation call returns `success: false` then it is automatically marked as `disabled`, once all `providers` are initialised the `OREvent.CONSOLE_INIT` event is raised. The app can retrieve the `console` instance as described above and it can check the status of each `provider` and take appropriate action if desired.

#### Enable
Once all providers are initialised then the app is free to decide when to enable each provider (if `consoleAutoEnable: false` otherwise they will be auto enabled); where a provider returned `requiresPermission=true && hasPermission=false` then the client is best placed to decide when and how to ask for permissions and should use good UX principles to avoid users denying such permission requests (see [permission-ux](https://developers.google.com/web/fundamentals/push-notifications/permission-ux)). Providers that don't require permissions or already have permissions could be enabled immediately. The enable message structure is:
```
{
   action: "PROVIDER_ENABLE",
   provider: "PROVIDER_NAME",
   consoleId: "hhjfksdhf786382yrusd6f782",
   data: JSON [any data that the app wishes to pass to this provider that may be required for enabling it]
}
```
The console then asks the user for the necessary permission(s) (if not done already) and enables the functionality of this provider then posts a message back to the app:
```
{
   action: "PROVIDER_ENABLE",
   provider: "PROVIDER_NAME",
   hasPermission: true|false [true=user granted permission; false=user denied permission]
   success: true|false [true=enabled success; false=enabled failure]
   data: JSON [any data that the provider wishes to return to the app for use by the app and/or for sending to the server]
}
```
#### Disable
The app can disable a provider by sending the following message to the console:
```
{
   action: "PROVIDER_DISABLE",
   provider: "PROVIDER_NAME"
}
```
The console then does any required disabling of the provider and posts a message back to the app:
```
{
   action: "PROVIDER_DISABLE",
   provider: "PROVIDER_NAME"
}
```
#### Provider independence
Some providers 'run' independently of the app in the background (e.g. push, geofence), providers can also communicate with each other where supported (e.g. push provider telling the geofence provider to refresh the geofences) how they do this is of no concern to the app.

As well as the standard messages above; the app can interact with individual providers using the provider's specific messages as described below.


## Standard Providers
### Push Provider (provider: "push")
Allows data/notifications to be remotely pushed to the console. There are two types of standard push provider depending on the platform and the data sent and returned from the enable message depends on the type used:

### FCM Push (Android & iOS)
* Supports silent (data only) push notifications
* Supports topics

#### Enabled message request data (App -> Console)
Array of topics to subscribe to (optional):
```
{
   topics: ["update", "custom"]
}
```

#### Enabled message response data (Console -> App)
```
{
   token: "23123213ad2313b0897efd",
}
```

### Web Push (Web Browsers)
* No topic support (yet)
* No silent (data only) push notifications

#### Enabled message request data (App -> Console)
```
NONE
```

#### Enabled message response data (Console -> App)
The data structure returned from the enabled message request is:
```
{
  "endpoint": "https://some.pushservice.com/something-unique",
  "keys": {
    "p256dh": "BIPUL12DLfytvTajnryr2PRdAgXS3HGKiLqndGcJGabyhHheJYlNGCeXl1dn18gSJ1WAkAPIxr4gK0_dQds4yiI=",
    "auth":"FPssNDTKnInHVndSTdbKFw=="
  }
}
```

#### Received message (Console -> App)
Called for both types when a push notification is received:
```
{
   provider: "PROVIDER_NAME",
   action: "PUSH_RECEIVED",
   title: "Hello",
   text: "This is a push notification",
   data: JSON (data payload supplied with the push message),
   foreground: true|false (was notification received whilst console/client was in the foreground)
   coldStart: true|false (was the console/client started by clicking the notification)
}
```

### Geofence Provider (provider: "geofence")
Use platform geofence APIs (Android and iOS); the provider expects a public endpoint on the OR manager at `rules/geofences/{consoleId}` which it can call to get the geofences for this console. The geofence definitions returned by this endpoint and the behaviour of this provider should match the definitions in the asset location tracking wiki.

#### Enabled message request data (App-> Console)
```
NONE
```

#### Enabled message response data (Console -> App)
```
NONE
```

#### Refresh message (App -> Console)
Tell the provider to fetch the latest geofence definitions and to update its local geofences.
```
{
   action: "GEOFENCE_REFRESH"
}
```


### Storage Provider (provider: `storage`)
Allows for storing data locally on the console, well known keys are:
- `REFRESH_TOKEN` - Used to store offline refresh token for `keycloak` authentication (should only be stored in secure environment - not in the browser).

#### Enabled message request data (App-> Console)
```
NONE
```

#### Enabled message response data (Console -> App)
```
NONE
```

#### Store data message (App -> Console)
Tell the provider to store the specified data.
```
{
   action: "STORE",
   key: "DATA_KEY",
   value: JSON (set to null to remove the key from the store)
}
```

#### Retrieve data message request (App -> Console)
Get data from the provider.
```
{
   action: "RETRIEVE",
   key: "DATA_KEY"
}
```

#### Retrieve data message response (Console -> App)
Returns the requested data from the provider.
```
{
   action: "RETRIEVE",
   key: "DATA_KEY",
   value: JSON
}
```


### TODO Notification Provider (provider: "notification")
Show a notification immediately using the platforms standard mechanism (without using Push API)

#### Enabled message request data (App -> Console)
No data

#### Enabled message response data (Console -> App)
No data

#### Show message (App -> Console)
The client can show a notification by sending the following message to the console:
```
{
   action: "NOTIFICATION_SHOW",
   data: {
      id: 1,
      title: "Hello",
      text: "This is a notification message!",
      data: JSON (any data to pass to notification click handler)
   }
```

#### Clicked message (Console -> App)
The client can listen for notification click events by listening for the following messages:
```
{
   action: "NOTIFICATION_CLICKED",
   title: "Hello",
   text: "This is a push notification",
   data: JSON (data payload supplied with the notification),
}
```

### QR Scanner Provider (provider: "qr")
Open up a native view which enables the camera of the device to scan a QR code and send the content back to the app.

#### Enabled message request data (App -> Console)
No data

#### Enabled message response data (Console -> App)
No data

#### Scan QR Code (App -> Console)
Start the camera and scan a QR code.
```
{
    action: "SCAN_QR"
}
```
#### Scan QR Code (Console -> App)
```
{
    action: "SCAN_QR",
    provider: "qr",
    data: {
        result: <qr_content>
   }
}
```
