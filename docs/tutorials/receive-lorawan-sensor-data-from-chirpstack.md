---
sidebar_position: 3
---

# ChirpStack LoRaWAN Integration

[ChirpStack](https://www.chirpstack.io/) is an open source LoRaWAN network server stack. This tutorial explains how to receive LoRaWAN sensor data via ChirpStack using the [MQTT Agent](../user-guide/agents-protocols/mqtt). The tutorial is based on the [Dragino LHT65](https://www.dragino.com/products/temperature-humidity-sensor/item/151-lht65.html) LoRaWAN sensor device as an example.

## Install and start ChirpStack
1. Make a copy of the ChirpStack Docker repository with the following commands:
```
git clone https://github.com/brocaar/chirpstack-docker.git
cd chirpstack-docker
```
2. Start ChirpStack
```
docker-compose up
```
3. Login to the ChirpStack UI (`http://localhost:8080/` `admin/admin`)
## Create the ChirpStack LoRaWAN Gateway
1. Navigate to the `Service-profiles` page and click the `+ Create` button.
2. Create a service profile with the following settings: 
   * Add gateway meta-data: `enabled`
   * Enable network geolocation: `enabled`
   * Minimum allowed data-rate: `0` 
   * Maximum allowed data-rate: `5` (Europe), `4` (US)    
3. Navigate to the `Gateways` page and click `+ Create` button.
4. Create a gateway with the following settings:
   * Gateway ID: 8 byte hexadecimal number (e.g. a841452101b04161, see gateway device manual for how to retrieve the gateway ID)
   * Network-server: `docker-network-server`
   * Service-profile: service profile you created earlier
## Create the ChirpStack LoRaWAN Device
1. Navigate to the `Applications` page and click the `+ Create` button.
2. Create an application with the following setting:
   * Service-profile: service profile you created earlier
3. Navigate to the `Device-profiles` page and click the `+ Create` button.  
4. Create a device profile with the following settings:
   * General:
      * LoRaWAN MAC version: see device manual (select `1.0.3` in case of Dragino LHT65)
      * LoRaWAN Regional Parameters revision: see device manual (select `A` in case of Dragino LHT65)
      * Max EIRP: `14` (Europe)
      * Uplink interval (seconds): see device configuration (select `1200` in case of Dragino LHT65)
   * JOIN (OTAA/ABP):
      * Device supports OTAA: `enabled`
   * CODEC:        
      * Custom JavaScript decoder function: add a function that decodes the base64 encoded binary data (in case of the Dragino LHT65 go to the [Dragino LHT65 support page](https://www.dragino.com/downloads/index.php?dir=LHT65/payload_decode/) in order to download a ChirpStack data decoder).
5. Navigate to the `Applications` page and select the application you created earlier
6. On the `Devices` tab click the `+ Create` button.
7. Create a device with the following settings:
   * General:
      * DeviceEUI: 8 byte hexadecimal number (see LoRa device manual for how to retrieve this identifier from the device).
      * Device-profile: device profile you created earlier               
8. Navigate to the `KEYS (OTAA)` tab and configure the new device with the following setting:
   * Application key: 16 byte hexadecimal number (see device manual for how to retrieve the application key from the device). 
## Create the OpenRemote MQTT agent
1. Login to the OpenRemote manager UI (`https://localhost/` `admin/secret`)
2. Navigate to the `Assets` page, click `+` in the asset tree on the left.
3. In the `Add asset` dialog do the following:
   * Select the `MQTT Agent` asset type in the list
   * Name: `ChirpStack MQTT Agent`
   * Confirm with `ADD`    
4. Click `Modify` and configure the following asset attributes:
   * Host: IP address of the ChirpStack server (e.g. 192.168.170.83)
   * Port: `1883`
   * Confirm with `SAVE`
## Create the OpenRemote LoRaWAN device asset   
1. Navigate to the `Assets` page, click `+` in the asset tree on the left.
2. In the `Add asset` dialog do the following:
   * Select the `Thing Asset` type
   * Name: `Dragino LHT65`
   * Confirm with `ADD`
3. Click `Modify`
4. Click `ADD ATTRIBUTE` and do the following in the `Add attribute` dialog:
   * Type: `Custom attribute`
   * Name: `Temperature`
   * Value type: `Number`
   * Confirm with `ADD`
5. Expand the `Temperature` attribute and click `ADD CONFIGURATION ITEMS`
6. In the `Add configuration items` dialog do the following:
   * Select `Agent link` in the list
   * Confirm with `ADD`
7. Expand the `Agent link` configuration item and configure the `Agent ID`:
   * Agent ID: `Chirpstack MQTT Agent`
8. Click `ADD PARAMETER` in order to add the MQTT topic configuration.
9. In the `Add parameter` dialog do the following:
   * Select `Subscription Topic`
   * Confirm with `ADD`
10. Edit the `Subscription Topic`.

    The ChirpStack MQTT topic for sensor values has the following format:
    ```
    application/{application id}/device/{deviceEUI}/event/up

    application id: see Applications list in the Chirpstack UI
    deviceEUI: 8 byte hexadecimal LoRaWAN device identifier
    ```
    Example for the `Subscription Topic` value:
    ```
    application/1/device/a841452101b04161/event/up
    ```
11. Click `ADD PARAMETER` in order to add a json path configuration.
12. In the `Add parameter` dialog do the following:
   * Select `Value Filters`
   * Confirm with `ADD`
13. Expand the new `Value Filters` parameter and click `ADD ITEM`
14. In the `Add item` dialog do the following:
   * Select `JSON Path`
   * Confirm with `ADD`
15. Expand the new `JSON Path` item and do the following:
   * Path: `$.object.TempC_DS` (Note: this is an example for the Dragino LHT65 data decoder)
   * Return First: `enabled`

The following json structure shows an example of the Dragino LHT65 MQTT topic value:    
```json
{
  "applicationID":"1",
  "applicationName":"dragino-lht65-application",
  "deviceName":"dragino-lht65",
  "deviceProfileName":"lht65-profile",
  "deviceProfileID":"c3eb48d6-eddc-4038-bee9-1d5855d98d90",
  "devEUI":"a841452101b04161",
  "rxInfo":[
      {
        "gatewayID":"3499452178b04155",
        "uplinkID":"a1da5994-04c9-4bb7-ad2d-088c8668d2d1",
        "name":"dragino-lg308",
        "rssi":-55,
        "loRaSNR":9.5,
        "location": {
          "latitude":8.232323023,
          "longitude":7.8383283838,
          "altitude":664}
      }
  ],
  "txInfo": {
    "frequency":868100000,
    "dr":5
  },
  "adr":true,
  "fCnt":2064,
  "fPort":2,
  "data":"y+AG5wFZAQawf/8=",
  "object": {
    "BatV":3.04,
    "Ext_sensor":"Temperature Sensor",
    "Hum_SHT":"34.5",
    "TempC_DS":"17.12",
    "TempC_SHT":"17.67"
  }
}
```
16. Click `SAVE`    
