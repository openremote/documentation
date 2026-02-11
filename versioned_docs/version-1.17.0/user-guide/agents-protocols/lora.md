---
sidebar_position: 7
---

# LoRa

The documentation on this page focuses on custom protocol implementations built directly on top of the **LoRa PHY (Physical Layer)**, such as mesh networks, rather than standard LoRaWAN network server integrations.

:::note
For standard **LoRaWAN** network server support, please refer to the following protocol documentation:
* **[ChirpStack](chirpstack.md)**
* **[The Things Stack (TTS)](the-things-stack.md)**

If you require a technical deep dive into manual configuration of MQTT agent links, see the **[Manual ChirpStack Tutorial](../../tutorials/receive-lorawan-sensor-data-from-chirpstack.md)**.
:::

## Proof of concept for LoRa mesh network for GPS trackers

A couple of students have worked on a generic way to use LoRa to connect several devices in a mesh network and link these through a Protocol Agent with OpenRemote. In the specific application they have developed a Range of LoRa GPS trackers which allow for integrating all these trackers, including their live location within OpenRemote.

Both the firmware running on the individual devices, as well as the Protocol Agent for OpenRemote is available as a separate project ['or-loratrackers'](https://github.com/openremote/or-loratrackers).
It includes a generic asset and attribute model such that the code can be applied for any kind of application and asset model in which you like to build your own connected network of devices leveraging a mesh. 

As this is a proof of concept we value feedback and looking for anybody interested in following up on this. Just get in touch.
