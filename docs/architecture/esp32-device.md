---
sidebar_position: 5
---

# ESP32 devices

Many IoT devices are or can be based on an ESP32 microcontroller.  
A typical setup for integrating such a device in the OpenRemote ecosystem includes 3 components:
- a firmware running on the ESP32 MCU in the device
- a mobile app to configure the device and connect to the backend
- the OpenRemote backend

```mermaid
graph LR
    %% Styling Definitions
    classDef greenStyle fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000;
    classDef innerGreenStyle fill:#e8f5e9,stroke:#28a745,stroke-width:1px,color:#000;
    classDef orangeStyle fill:#ffe0b2,stroke:#f57c00,stroke-width:2px,color:#000;
    classDef redStyle fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#000;
    classDef purpleStyle fill:#e1bee7,stroke:#7b1fa2,stroke-width:2px,color:#000;

    App[App]:::orangeStyle

    OR[Backend]:::greenStyle
    
    ESP[Device]:::purpleStyle

    %% Connections
    App <--> OR
    App <--> ESP
    ESP <--> OR
```

We offer software elements to support the development of all 3 components.

A device is represented in the OpenRemote backend by an asset of a specific type.
The device communicates with OpenRemote over MQTTS, authenticated with a dedicated service user.

In this typical use case, the device uses Wifi for its internet connectivity.

To integrate a new device into the system, it needs to be provisioned.  
This can either be done automatically, see [User Guide Auto provisioning](/user-guide/gateways-and-devices/auto-provisioning.md)  
or through a manual process performed by the end-user.

For the latter case, the workflow is as follows

```mermaid
sequenceDiagram
    autonumber
    
    Note over User,Backend: User login
    
    User->>App: Login
    App->>Backend: Authenticate user
    Backend-->>App: Authenticated
    
    Note over User,Backend: Device WiFi provisioning
    
    User->>Device: Put in discovery mode
    App->>App: Start device scan
    Device-->>App: Device name
    User->>App: select device
    App->>App: Stop device scan
    App->>Device: Connect
    Device->>App: Get PoP
    App-->>Device: PoP
    App->>Device: Start WiFi scan
    Device-->>App: WiFi information
    User->>App: Select WiFi (or join other)
    User->>App: Enter WiFi password
    App->>Device: WiFi configuration
    Device->>App: WiFi connection status
    
    Note over User,Backend: Device provisioning
    
    App->>Device: Get Device Id (DeviceInfo Request)
    Device-->>App: Device Id (DeviceInfo Response)
    
    App->>App: Create password
    App->>Backend: Provision device
    Note right of App: App provides Device Id and password
    
    Backend->>Backend: Create Device Asset
    Note right of Backend: Asset is linked to user account
    
    Backend->>Backend: Create Service Account
    Note right of Backend: Service Account is restricted<br/>and only has rights on the Device Asset.<br/>username is Device Id
    
    Backend-->>App: Confirmed
    Note right of Backend: Returns Asset Id
    
    App->>Device: Send configuration (OpenRemoteConfig Request)
    Device->>Backend: connect
    Note right of Device: Over MQTTS using username/password<br/>(Service Account)
    
    Device-->>App: Status (OpenRemoteConfig Response)
    App->>Device: Get connection status (BackendConnectionStatus Request)
    Device-->>App: connection status (BackendConnectionStatus Response)
    Note right of Device: Repeat to poll for connected status  
```

Communication between the Mobile Application and the Device is based on Espressif [Unified Provisioning](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/provisioning/provisioning.html).  
This mechanism is used to discover the device, then establish a secure communication channel over BLE.  
Communication on this channel uses Protocol Buffer payloads, in addition to the messages defined by Espressif, OpenRemote uses messages defined in the following ProtoBuf spec: [ORConfigChannelProtocol](https://github.com/openremote/console-ios-lib/blob/7212bc905c7df34c2f3d62f801f0e4df7529a2f0/ORLib/ORConfigChannelProtocol.proto)  
OpenRemote includes the [ESP Provision provider](apps-and-consoles.md#esp-provision-provider-espprovision) to support the implementation of the mobile application side.

On the backend, the project must implement a single `/rest/device` endpoint, see [Provision Device API](../provisioning-api/provisions-a-new-device-for-the-user.api.mdx) for more details.
