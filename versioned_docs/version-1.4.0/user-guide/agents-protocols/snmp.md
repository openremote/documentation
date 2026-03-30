---
sidebar_position: 9
---

# SNMP

Connect to a SNMP server and listen to SNMP traps.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `bindHost` | Bind hostname or IP address | [Hostname or IP address](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L153) | Y |
| `bindPort` | Bind port | [Port number](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L148) | N (Default = `162`) |
| `SNMPVersionValue` | SNMP Version | Text (`V1`, `V2c`, `V3c`) | N |


## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `SNMPAgentLink`) | Y |
| `oid` | The OID of the SNMP trap parameter | Text (OID e.g. `1.3.6.1.4.1.8072.2.3.2.1`) | Y |


### Wildcard
Use a value of `*` for `oid` to retrieve the entire trap message.


## Additional info
To test the agent link you can send the following message from a terminal:

`sudo snmptrap -v 2c -c public <your-machines-ip-address> '' 1.3.6.1.4.1.8072.2.3.0.1 1.3.6.1.4.1.8072.2.3.2.1 i 123456`

The SNMP value attribute should now have the value `123456`.
