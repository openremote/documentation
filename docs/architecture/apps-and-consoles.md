---
sidebar_position: 3
---

# Apps and consoles

## Terminology
### App (Client)
A frontend application that optionally consumes the OR APIs; same meaning as OAuth client (The OR Manager web application is a client; for custom projects there could be zero or more apps where each app may be used across one or more realms, the apps generally provide very specific functionality as required by the project). These are generally responsive web applications.

### Console
This is the application used to load the client and can be thought of as a wrapper around a client e.g. Web Browser, Android/iOS App. Generally this is an application capable of loading a web view that renders the client. A console could be hardcoded to a specific realm and client or it could be more configurable depending on requirements. A web browser requires no installation whereas Android/iOS consoles are pre-compiled and distributed.

## Console/app interaction
Apps and consoles exchange information using the API described below which consists of `providers`, a `provider` is a piece of functionality that the console provides to the app, messages can be sent bidirectionally between the console and app. The Android and iOS consoles implement a standard mechanism for this communication. When running an app in the Web Browser the `@openremote/core` component handles communication and implements a limited subset of `providers` (e.g. `push`). The console is accessed via the `console` property on the `@openremote/core` component but it is also exported globally as `OpenRemoteConsole`:
```typescript
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
```json
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
```json
{
   action: "PROVIDER_INIT",
   provider: "PROVIDER_NAME"
}
```
The console then does any required initialisation and sends a message back to the app:
```json
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
```json
{
   action: "PROVIDER_ENABLE",
   provider: "PROVIDER_NAME",
   consoleId: "hhjfksdhf786382yrusd6f782",
   data: JSON [any data that the app wishes to pass to this provider that may be required for enabling it]
}
```
The console then asks the user for the necessary permission(s) (if not done already), then enables the functionality of this provider and posts a message back to the app:
```json
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
```json
{
   action: "PROVIDER_DISABLE",
   provider: "PROVIDER_NAME"
}
```
The console then does any required disabling of the provider and posts a message back to the app:
```json
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
```json
{
   topics: ["update", "custom"]
}
```

#### Enabled message response data (Console -> App)
```json
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
```json
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
```json
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
Use platform geofence APIs (Android and iOS); the provider expects a public endpoint on the OR manager at `rules/geofences/{consoleId}` which it can call to get the geofences for this console. The geofence definitions returned by this endpoint and the behaviour of this provider should match the definitions in the asset location tracking documentation.

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
```json
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
```json
{
   action: "STORE",
   key: "DATA_KEY",
   value: JSON (set to null to remove the key from the store)
}
```

#### Retrieve data message request (App -> Console)
Get data from the provider.
```json
{
   action: "RETRIEVE",
   key: "DATA_KEY"
}
```

#### Retrieve data message response (Console -> App)
Returns the requested data from the provider.
```json
{
   action: "RETRIEVE",
   key: "DATA_KEY",
   value: JSON
}
```


### Notification Provider (provider: "notification")

**This is a specification for a forthcoming provider, no implementation has been done yet!**

Show a notification immediately using the platforms standard mechanism (without using Push API)

#### Enabled message request data (App -> Console)
No data

#### Enabled message response data (Console -> App)
No data

#### Show message (App -> Console)
The client can show a notification by sending the following message to the console:
```json
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
```json
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
```json
{
    action: "SCAN_QR"
}
```
#### Scan QR Code (Console -> App)
```json
{
    action: "SCAN_QR",
    provider: "qr",
    data: {
        result: <qr_content>
   }
}
```

### ESP Provision (provider: "espprovision")
Allows provisioning an ESP32 device in the system via a 3-step workflow:
1. discover the device and establish a secure communication to the device over BLE
2. discover Wifi networks and configure the device to connect to it
3. provision the device in the backend and configure the device to connect to the backend

This is based on Espressif [Unified Provisioning](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/provisioning/provisioning.html)
and uses their [esp-idf-provisioning-ios](https://github.com/espressif/esp-idf-provisioning-ios) and [esp-idf-provisioning-android](https://github.com/espressif/esp-idf-provisioning-android) libraries.

#### Start BLE scan (App -> Console)

Starts a BLE scans without any timeout.

```json
{
    "provider": "espprovision",
    "action": "START_BLE_SCAN",
    "prefix": "PROV_"
}
```

The prefix value is optional, if not specified a default empty value is used.

The returned devices are filtered based on their service name having the given prefix.

#### BLE scan error response (Console -> App)

If there’s an error starting or during the scan, the following message is sent

```json
{
    "provider": "espprovision",
    "action": "STOP_BLE_SCAN",
    "errorCode": <see table below>,
    "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```

All errors will be reported to the web application and not handled by the native code.

| Error          | errorCode | Reason                                                                                                |
|----------------|-----------|-------------------------------------------------------------------------------------------------------|
| Timeout        | 600       | A timeout (120s) occurred during device search (even if some devices were already found and reported) |
| Generic error  | 10000     | A non specific error has occurred                                                                     |

#### BLE scan response (Console -> App)

Periodically during the scan, if the provider has found BLE devices, it will send the complete list to the web app using the below structure

```json
{
    "provider": "espprovision",
    "action": "START_BLE_SCAN",
    "devices": [
        {
        "id": "",
        "name": "",
        "signalStrength": ""
        }, ...
    ]
}
```
signalStrength is optional, it will not be present in a first version.

#### Stop BLE scan (App -> Console)

Stops on-going BLE scans, calling this if none is underway is not an error.

```json
{
  "provider": "espprovision",
  "action": "STOP_BLE_SCAN"
}
```

#### BLE scan stop response (Console -> App)

Always sends back a confirmation message, even if no scan was underway.  
This message is also sent when the scan is stopped upon connection to a device.

```json
{
  "provider": "espprovision",
  "action": "STOP_BLE_SCAN"
}
```

#### Connect to device (App -> Console)

Establishes a secure connection to the device with the given id.

This also stops any BLE scan that was in progress.

```json
{
  "provider": "espprovision",
  "action": "CONNECT_TO_DEVICE",
  "id": "",
  "pop": "xyz"
}
```

The pop (Proof of Possession) is used for establishing the security layer of the device communication channel.
If not provided, a default value is used.

#### Device connection status (Console -> App)

Connection status information can be sent at any time (and multiple times),
e.g. if at any point the BLE connection is lost, message with status `disconnected` is sent.

```json
{
  "provider": "espprovision",
  "action": "CONNECT_TO_DEVICE",
  "id": "",
  "status": "connected" | "disconnected" | "connectionError",
  "errorCode": <see table below>,
  "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```

Possible error codes
| Error                | errorCode | Reason                                                                    |
|----------------------|-----------|---------------------------------------------------------------------------|
| Unknown device       | 100       | The provided id was not discovered in the previous search                 |
| BLE connection error | 200       | Error establishing a BLE connection with the device                       |
| Communication error  | 301       | Error establishing a connection with the device (on top of BLE connection)|
| Security error       | 400       | Error while handling security (includes invalid credentials)              |
| Generic error        | 10000     | A non specific error has occurred                                         |

#### Disconnect from device (App -> Console)

```json
{
  "provider": "espprovision",
  "action": "DISCONNECT_FROM_DEVICE"
}
```

#### Start Wifi scan (App -> Console)

Asks the connected device to start a WiFi scan without any timeout.

```json
{
  "provider": "espprovision",
  "action": "START_WIFI_SCAN"
}
```

#### Wifi scan error response (Console -> App)

If there’s an error starting or during the scan, the following message is sent
```json
{
  "provider": "espprovision",
  "action": "STOP_WIFI_SCAN",
  "errorCode": <see table below>,
  "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```

| Error               | errorCode | Reason                                                                                      |
|---------------------|-----------|--------------------------------------------------------------------------------------------|
| Not connected       | 300       | There is no communication channel with the device                                          |
| Communication error | 301       | Error in communication with device to start scan or receive information back               |
| Timeout             | 600       | A timeout (120s) occurred during wifi scan (even if some networks were already found and reported) |

#### Wifi scan response (Console -> App)

Periodically during the scan, if the provider has found SSIDs, it will send the complete list to the web app using the below structure

```json
{
  "provider": "espprovision",
  "action": "START_WIFI_SCAN",
  "networks": [
    {
      "ssid": "",
      "signalStrength": -12
    }, ...
  ]
}
```

#### Stop Wifi scan (App -> Console)

Stops on-going WiFi scans, calling this if none is underway is not an error.

```json
{
  "provider": "espprovision",
  "action": "STOP_WIFI_SCAN"
}
```

#### Stop Wifi scan response (Console -> App)

Always sends back a confirmation message, even if no scan was underway.
```json
{
  "provider": "espprovision",
  "action": "STOP_WIFI_SCAN"
}
```
Implementation note: there is no command to stop the WiFi scan on the device, but it only does it for a limited amount of time.
The provider is the one implementing a loop to scan “indefinitely”.
When the STOP_WIFI_SCAN command is sent, the provider stops this loop.

#### Send Wifi configuration (App -> Console)

Sends SSID and password to the device for it to configure its Wifi network.

This also stops any WiFi scan that was in progress.

```json
{
  "provider": "espprovision",
  "action": "SEND_WIFI_CONFIGURATION",
  "ssid": "",
  "password": ""
}
```

#### Wifi configuration response (Console -> App)

Once device has reported its status, the following information is sent by the provider

```json
{
  "provider": "espprovision",
  "action": "SEND_WIFI_CONFIGURATION",
  "connected": true | false,
  "errorCode": <see table below>,
  "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```
| Error                      | errorCode | Reason                                                                   |
|----------------------------|-----------|--------------------------------------------------------------------------|
| Not connected              | 300       | There is no communication channel with the device                        |
| Communication error        | 301       | Error in communication with device to start scan or receive information back |
| WiFi configuration error   | 500       | Error in applying the provided Wifi configuration                        |
| Wifi communication error   | 501       | Could not determine the status of the Wifi network                       |
| Wifi authentication error  | 502       | Wrong Wifi credentials                                                   |
| Wifi network not found     | 503       | Could not find given Wifi network                                        |
| Generic error              | 10000     | A non specific error has occurred                                        |

#### Provision device (App -> Console)
```json
{
  "provider": "espprovision",
  "action": "PROVISION_DEVICE",
  "userToken": ""
}
```

Provisions the device with the backend. A valid authentication token towards the backend,
as the user logged in to the app, must be provided in `userToken`.

The provider will perform all the required steps to accomplish this and notify back the status to the caller.

This includes:
- Getting the model name and device id from the device
- Generating a random password
- Provisioning the device with the backend, creating the required asset and service account.  
  The provider performs a `POST` on `/rest/device` to trigger this.
- Linked the created asset to the end user account (corresponding to userToken)
- Sending the required configuration to the device
- Waiting for the device to connect

#### Provision device response (Console -> App)

Once the device is connected to the backend or if connection failed, the following information is sent by the provider

```json
{
  "provider": "espprovision",
  "action": "PROVISION_DEVICE",
  "connected": true | false,
  "errorCode": <see table below>,
  "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```

| Error               | errorCode | Reason                                                                       |
|---------------------|-----------|------------------------------------------------------------------------------|
| Not connected       | 300       | There is no communication channel with the device                            |
| Communication error | 301       | Error in communication with device to start scan or receive information back |

#### Exit provisioning (App -> Console)

```json
{
  "provider": "espprovision",
  "action": "EXIT_PROVISIONING"
}
```
Asks the device to exit provisioning mode.

#### Exit provisioning response (Console -> App)

Once the device is out of provisioning mode, the following information is sent by the provider

```json
{
  "provider": "espprovision",
  "action": "EXIT_PROVISIONING",
  "exit": true | false,
  "errorCode": <see table below>,
  "errorMessage": "An optional detail message about the error, not meant for end-user"
}
```

| Error               | errorCode | Reason                                                                       |
|---------------------|-----------|------------------------------------------------------------------------------|
| Not connected       | 300       | There is no communication channel with the device                            |
| Communication error | 301       | Error in communication with device to start scan or receive information back |
| Generic error       | 10000     | A non specific error has occurred                                            |
