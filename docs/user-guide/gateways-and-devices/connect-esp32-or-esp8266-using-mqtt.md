---
sidebar_position: 3
---

# Connect ESP32 or ESP8266 using MQTT

ESP32 and ESP8266 are some of the most popular and well established boards for devices by Espressif. ESP32 and ESP8266 (and other types) can be easily linked to an OpenRemote instance using our MQTT Broker. If you have larger numbers of devices connecting you might want to use the auto provisioning flow. This allows you to provision your devices in such a way that they automatically connect your devices to OpenRemote, create an asset of the type you have defined, and link the attributes over the right topics. ESP32 and and ESP8266 are perfectly suitable to make use of it.

Here are some practical tips and code samples to get you going.

## Publishing and subscribing to topics over MQTT

This a basic MQTT example for connecting to the OpenRemote MQTT Broker. It consists of two files `OpenRemoteESP32.ino` and `secret.h`. Take care you adjust `yourrealm`, `ClientID`, `AttributeName`, and `AssetID` for each topic to match your setup. Also add a valid certificate.

<details>
<summary>OpenRemoteESP32.ino</summary>

```
##include "secret.h"
//#include <ESP8266WiFi.h> // remove comment for ESP8266, and add comment at #include <WiFi.h> 
##include <WiFi.h>
##include <PubSubClient.h>

//Objects
WiFiClientSecure askClient; //SSL Client
//WiFiClient askClient; //Non-SSL Client, also remove the comments for askClient.setCACert(local_root_ca);

PubSubClient client(askClient);

void setup() {
  Serial.begin(115200);
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);

  }

  Serial.println(WiFi.localIP());
  askClient.setCACert(local_root_ca); //If you use non SSL then comment out
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

}

void loop() {
  //Publish Boolean format:
  client.publish("yourrealm/ClientID/writeattributevalue/AttributeName/AsssetID", "1");
  //To publish Strings:
  client.publish("yourrealm/ClientID/writeattributevalue/AttributeName/AssetID", String("Hello").c_str());
  delay(10000);

}

//MQTT callback
void callback(char* topic, byte * payload, unsigned int length) {

  for (int i = 0; i < length; i++) {
    Serial.println(topic);
    Serial.print(" has send ");
    Serial.print((char)payload[i]);
  }

}

//MQTT reconnect
void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("********** Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(ClientID, username, mqttpass, lastwill, 1, 1, lastwillmsg)) {
      Serial.println("-> MQTT client connected");
      client.subscribe(topic);
      Serial.print("Subscribed to: ";
      Serial.println(topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println("-> try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

```

</details>

This Code is for an ESP32. In case you use an ESP8266, change the WiFi Library. #include &lt;ESP8266WiFi.h> (see code)

For ESP8266 SSL Connection, you need a fingerprint of your Server Certificate Example: 
`"static const char *fingerprint PROGMEM = "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00";"` 
and in the setup: 
`askClient.setFingerprint(fingerprint);`

This sketch demonstrates the basic capabilities of the library. It connects to the OpenRemote MQTT Broker then:

- publishes boolean "1" to your topic
- publishes "Hello" to another topic
- subscribes to your topic printing out any messages

It will reconnect to the server if the connection is lost using a blocking reconnect function.


<details>
<summary>secret.h</summary>

```
// Wifi 
const char* ssid = "xxxxxxxxxx"; // Wifi SSID
const char* password = "xxxxxxxxxx"; // Wifi Password

//MQTT Broker
const char* mqtt_server = "xxxxxxxxxx";
unsigned int mqtt_port = 1883; //SSL 8883 NoneSSL 1883
const char* username = "yourrealm:xxxxxxxxxx"; // Service User Realm:Serviceuser
const char* mqttpass = "xxxxxxxxxx"; // Service User Secret
const char* ClientID = "xxxxxxxxxx";
//LastWill
const char* lastwill = "yourrealm/ClientID/writeattributevalue/AttributeName/AssetID";
const char* lastwillmsg = "0";


//subscribing Topic
const char *topic = "yourrealm/ClientID/attributevalue/AttributeName/#"; //see Subscribing Topics in Documentation /docs/user-guide/manager-apis#mqtt-api-mqtt-broker


//Local CA

const char* local_root_ca = \
                            "-----BEGIN CERTIFICATE-----\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n" \
                            "xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
                            "-----END CERTIFICATE-----";
```

</details>

Edit secret.h for your credentials.

In case you connect to the broker nonsecure, change the object "WifiClientSecure" to "WifiClient" and comment out in setup askClient.setCACert(local_root_ca); Also change the MQTT Port in secret.h

Important: Don't forget to add the PubSubClient to your Library https://github.com/knolleary/pubsubclient

## Auto provisioning ESP32 based devices

OpenRemote supports auto provisioning which can also be applied with Espressif products. See the [User Guide Auto provisioning](auto-provisioning.md)

Note you need to add a CA certificate and add the code to locate the appropriate CA certificate for the server, making a secure connection possible.

## See Also
- [Tutorial: Connect your MQTT Client](../../tutorials/connect-your-mqtt-client.md)
- [User Guide: Manager APIs](../manager-apis/manager-apis.md)
- [User Guide: Auto Provisioning](../gateways-and-devices/auto-provisioning.md)
