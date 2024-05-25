---
sidebar_position: 13
---

# Velbus

Connect to a [Velbus](https://www.velbus.eu/) network using either of the following implementations:

* Direct RS232/Serial using `VMBRSUSB` or `VMB1USB` - [Velbus Serial Agent](https://github.com/openremote/openremote/blob/master/agent/src/main/java/org/openremote/agent/protocol/velbus/VelbusSerialAgent.java) (Requires a `device` mapping for `manager` docker container)
* TCP/IP using [VelServ](https://github.com/jeroends/velserv) or similar - [Velbus TCP Agent](https://github.com/openremote/openremote/blob/master/agent/src/main/java/org/openremote/agent/protocol/velbus/VelbusTcpAgent.java)


## Agent configuration
The following describes the supported agent configuration attributes:

### TCP
| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `host` | TCP server hostname or IP address | [Hostname or IP address](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L153) | Y |
| `port` | TCP server port | [Port number](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L148) | Y |

### Serial
| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `serialPort` | Serial port | Text | Y |


### TCP & Serial
| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `timeInjectionInterval` | Time injection interval (s) - as Velbus doesn't have RTC or support daylight saving time so this should be set to about 1hr | [Positive Integer](https://github.com/openremote/openremote/blob/master/model/src/main/java/org/openremote/model/value/ValueType.java#L83) | Y |

## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `VelbusAgentLink`) | Y |
| `deviceAddress` | The Velbus module address to link to | Integer (1-254) | Y |
| `deviceValueLink` | The Velbus module value to link to | Text (see [below](#device-value-link)) | Y |

## Discovery and Import
To understand discovery and import refer to [Agent and Asset Discovery/Import](overview.md#agent-and-asset-discoveryimport). This protocol supports the following:

* Protocol Asset Import (`*.vlp`)


***

## Hardware compatibility table

'x' indicates a colour option that does not affect the capability of the module.

Modules are queried for their module type during initialisation, non-compatible modules will **not work in any way**.

<table>
  <thead>
<tr>
<th>Module Type</th>
    <th>Firmware</th>
    <th>Date tested</th> 
    <th>Notes</th>
  </tr>

  </thead>
  <tbody>
  
  <tr>
    <td>VMBGPOx</td>
    <td>1436</td>
    <td>Aug 2015</td>
    <td>Don't send too many commands too quickly, leave reasonable delays between commands. </td>
  </tr>



  <tr>
    <td>VMBGPODx</td>
    <td>1436</td>
    <td>Aug 2015</td>
    <td>Don't send too many commands too quickly, leave reasonable delays between commands. </td> 
  </tr>


<tr>
    <td>VMBGP4x</td>
    <td></td>
    <td>Oct 2016</td>
    <td>Functions as expected</td> 
  </tr>

<tr>
    <td>VMBGP4PIRx</td>
    <td></td>
    <td>Oct 2016</td>
    <td>Functions as expected</td> 
  </tr>

<tr>
    <td>VMBGP2x</td>
    <td>1349</td>
    <td>Aug 2015</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMBGP1x</td>
    <td>1347</td>
    <td>Aug 2015</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMBGPOTCx</td>
    <td></td>
    <td>Aug 2015</td>
    <td>Not available for testing but all commands should function as expected</td> 
  </tr>

<tr>
    <td>VMB8PBU</td>
    <td>1350</td>
    <td>July 2015</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMB1TS</td>
    <td></td>
    <td>Jan 2017</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMB7IN</td>
    <td>1439</td>
    <td>July 2015</td>
    <td>All commands function as expected, Custom sensors seem to work better for energy values</td> 
  </tr>

<tr>
    <td>VMBPIROx</td>
    <td></td>
    <td>Oct 2016</td>
    <td>All commands function as expected</td> 
  </tr>


<tr>
    <td>VMBPIRC</td>
    <td></td>
    <td>Oct 2016</td>
    <td>Functions as expected</td> 
  </tr>

<tr>
    <td>VMBPIRM</td>
    <td></td>
    <td>Oct 2016</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMB2BLE</td>
    <td>1325</td>
    <td>July 2015</td>
    <td>All commands function as expected</td> 
  </tr>

<tr>
    <td>VMB1BLS</td>
    <td></td>
    <td>Aug 2015</td>
    <td>Not available for testing but assured they perform as single channel version of VMB2BLE</td> 
  </tr>

<tr>
    <td>VMBDMI</td>
    <td>1201</td>
    <td>July 2015</td>
    <td>All commands function as expected,  except ON command, use Dimmer_level:100 instead, &lt;However, this causes an Off & Memory toggle when used with a switch and slider combo. (Both methods were used on the same panel during testing) Switch will work perfectly on first load, but once a slider has been moved, then the switch (with commands OFF and Dimmer_Level:100) will only toggle between Off and Memory</td> 
  </tr>

<tr>
    <td>VMBDMI-R</td>
    <td></td>
    <td>Aug 2015</td>
    <td>All commands function as expected</td> 
  </tr>


<tr>
    <td>VMB4DC</td>
    <td>1327</td>
    <td>July 2015</td>
    <td>All commands function as expected,  except ON command, use Dimmer_level:100 instead, &lt;However, this causes an Off & Memory toggle when used with a switch and slider combo. (Both methods were used on the same panel during testing) Switch will work perfectly on first load, but once a slider has been moved, then the switch (with commands OFF and Dimmer_Level:100) will only toggle between Off and Memory</td> 
  </tr>



<tr>
<td>VMB4RYLD</td>
<td>1327</td>
<td>July 2015</td>
<td>All commands function as expected</td>
</tr>

<tr>
<td>VMB4RYNO</td>
<td>1327</td>
<td>July 2015</td>
<td>All commands function as expected</td>
</tr>


<tr>
<td>VMB1RYNO</td>
<td>1325</td>
<td>July 2015</td>
<td>All commands function as expected</td>
</tr>


<tr>
<td>VMB1RYNOS</td>
<td>1422</td>
<td>July 2015</td>
<td>All commands function as expected</td>
</tr>

<tr>
<td>VMBMETEO</td>
<td></td>
<td>Jan 2017</td>
<td>All commands function as expected</td>
</tr>

</tbody>

</table>

## Device value link
The following describes the supported values for the `deviceValueLink` Agent Link field, supported values are grouped by device function, please refer to VelbusLink or Velbus documentation to understand what functions each device type supports.


### Relay Channel
Parameter `X` must be replaced with a channel number (1-5).

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `CHX` | Channel state | Text (`OFF`, `ON`, `INTERMITTENT`) | Text (`OFF`, `ON`, `INTERMITTENT`) |
| `CHX_SETTING` | Channel setting | Text (`NORMAL`, `INHIBITED`, `FORCED`, `LOCKED`) | Text (`NORMAL`, `INHIBITED`, `FORCED`, `LOCKED`) |
| `CHX_LOCKED` | Channel lock (forced off) state | Boolean | Boolean |
| `CHX_INHIBITED` | Channel inhibit state | Boolean | Boolean |
| `CHX_FORCED` | Channel forced on state | Boolean | Boolean |
| `CHX_LED` | Channel LED state | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) |  |
| `CHX_ON` | Set channel on for specified duration (s) |  | Integer (0 = Off) |
| `CHX_INTERMITTENT` | Set channel intermittent for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_LOCK` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_FORCE_OFF` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_FORCE_ON` | Set channel forced on for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_INHIBIT` | Set channel inhibit for specified duration (s) |  | Integer (0 = Cancel) |

### Input Channel (Push Button)
Parameter `X` must be replaced with a channel number (1-32) depending on module type and configuration.

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `CHX` | Channel state | Text (`RELEASED`, `PRESSED`, `LONG_PRESSED`) | Text (`RELEASED`, `PRESSED`, `LONG_PRESSED`) |
| `CHX_LED` | Channel LED state | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) |
| `CHX_LOCKED` | Channel lock state | Boolean | Boolean |
| `CHX_ENABLED` | Channel enabled state | Boolean | Boolean |
| `CHX_INVERTED` | Channel inverted state | Boolean | Boolean |
| `CHX_LOCK` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |


### Temperature Sensor
Some modules support temperature but don't have thermostat (e.g. `VMBMETEO`)

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `TEMP_CURRENT` | Current temperature (°C) | Decimal |  |
| `TEMP_MIN` | Minimum temperature (°C) | Decimal |  |
| `TEMP_MAX` | Maximum temperature (°C) | Decimal |  |


### Thermostat

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `HEATER` | Heater state | Text (`RELEASED`, `PRESSED`) |  |
| `COOLER` | Heater state | Text (`RELEASED`, `PRESSED`) |  |
| `PUMP` | Heater state | Text (`RELEASED`, `PRESSED`) |  |
| `BOOST` | Heater state | Text (`RELEASED`, `PRESSED`) |  |
| `TEMP_ALARM1` | Alarm 1 state | Text (`RELEASED`, `PRESSED`) |  |
| `TEMP_ALARM2` | Alarm 2 state | Text (`RELEASED`, `PRESSED`) |  |
| `TEMP_ALARM3` | Alarm 3 state | Text (`RELEASED`, `PRESSED`) |  |
| `TEMP_ALARM4` | Alarm 4 state | Text (`RELEASED`, `PRESSED`) |  |
| `TEMP_STATE` | Thermostat state | Text (`DISABLED`, `MANUAL`, `TIMER`, `NORMAL`) | Text (`DISABLED`, `MANUAL`, `TIMER`, `NORMAL`) |
| `TEMP_MODE` | Thermostat mode | Text (`COOL_COMFORT`, `COOL_DAY`, `COOL_NIGHT`, `COOL_SAFE`, `HEAT_COMFORT`, `HEAT_DAY`, `HEAT_NIGHT`, `HEAT_SAFE`) | Text (`COOL_COMFORT`, `COOL_DAY`, `COOL_NIGHT`, `COOL_SAFE`, `HEAT_COMFORT`, `HEAT_DAY`, `HEAT_NIGHT`, `HEAT_SAFE`) |
| `TEMP_MODE_COOL_COMFORT_MINS` | Set mode to cool comfort for specified duration (mins) |  | Integer |
| `TEMP_MODE_COOL_DAY_MINS` | Set mode to cool day for specified duration (mins) |  | Integer |
| `TEMP_MODE_COOL_NIGHT_MINS` | Set mode to cool night for specified duration (mins) |  | Integer |
| `TEMP_MODE_COOL_SAFE_MINS` | Set mode to cool safe for specified duration (mins) |  | Integer |
| `TEMP_MODE_HEAT_COMFORT_MINS` | Set mode to heat comfort for specified duration (mins) |  | Integer |
| `TEMP_MODE_HEAT_DAY_MINS` | Set mode to heat day for specified duration (mins) |  | Integer |
| `TEMP_MODE_HEAT_NIGHT_MINS` | Set mode to heat night for specified duration (mins) |  | Integer |
| `TEMP_MODE_COOL_SAFE_MINS` | Set mode to heat safe for specified duration (mins) |  | Integer |
| `TEMP_TARGET_CURRENT` | Set current target temperature (°C) |  | Decimal |
| `TEMP_TARGET_COOL_COMFORT` | Set cool comfort target temperature (°C) |  | Decimal |
| `TEMP_TARGET_COOL_DAY` | Set cool day target temperature (°C) |  | Decimal |
| `TEMP_TARGET_COOL_NIGHT` | Set cool night target temperature (°C) |  | Decimal |
| `TEMP_TARGET_COOL_SAFE` | Set cool safe target temperature (°C) |  | Decimal |
| `TEMP_TARGET_CURRENT` | Set current target temperature (°C) |  | Decimal |
| `TEMP_TARGET_HEAT_COMFORT` | Set heat comfort target temperature (°C) |  | Decimal |
| `TEMP_TARGET_HEAT_DAY` | Set heat day target temperature (°C) |  | Decimal |
| `TEMP_TARGET_HEAT_NIGHT` | Set heat night target temperature (°C) |  | Decimal |
| `TEMP_TARGET_HEAT_SAFE` | Set heat safe target temperature (°C) |  | Decimal |

### Programs
Parameter `X` must be replaced with a channel number (1-32) depending on module type and configuration.

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `CHX_PROGRAM_STEPS_ENABLED` | Channel program steps enabled state | Boolean | Boolean |
| `CHX_PROGRAM_STEPS_DISABLED_SECONDS` | Disable channel program steps for specified duration (s) |  | Integer |
| `ALL_PROGRAM_STEPS_ENABLED` | Set all channels program steps enabled state |  | Boolean |
| `ALL_PROGRAM_STEPS_DISABLED_SECONDS` | Disable all channels program steps for specified duration (s) |  | Integer |
| `PROGRAM` | Current active program | Text (`NONE`, `SUMMER`, `WINTER`, `HOLIDAY`) | Text (`NONE`, `SUMMER`, `WINTER`, `HOLIDAY`) |
| `SUNRISE_ENABLED` | Sunrise steps enabled state | Boolean | Boolean |
| `SUNSET_ENABLED` | Sunset steps enabled state | Boolean | Boolean |
| `ALARM1_ENABLED` | Alarm 1 enabled state | Boolean | Boolean |
| `ALARM2_ENABLED` | Alarm 2 enabled state | Boolean | Boolean |
| `ALARM1_MASTER` | Alarm 1 member of master | Boolean | Boolean |
| `ALARM2_MASTER` | Alarm 2 member of master | Boolean | Boolean |
| `ALARM1_WAKE_TIME` | Alarm 1 wake time | Text (HH:MM) | Text (HH:MM) |
| `ALARM2_WAKE_TIME` | Alarm 2 wake time | Text (HH:MM) | Text (HH:MM) |
| `ALARM1_BED_TIME` | Alarm 1 bed time | Text (HH:MM) | Text (HH:MM) |
| `ALARM2_BED_TIME` | Alarm 2 bed time | Text (HH:MM) | Text (HH:MM) |

### Blind Channel
Parameter `X` must be replaced with a channel number (1-2) depending on module type.

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `CHX` | Channel state | Text (`UP`, `DOWN`, `HALT`) | Text (`UP`, `DOWN`, `HALT`) |
| `CHX_SETTING` | Channel setting | Text (`NORMAL`, `INHIBITED`, `INHIBITED_DOWN`, `INHIBITED_UP`, `FORCED_DOWN`, `FORCED_UP`, `LOCKED`) | Text (`NORMAL`, `INHIBITED`, `INHIBITED_DOWN`, `INHIBITED_UP`, `FORCED_DOWN`, `FORCED_UP`, `LOCKED`) |
| `CHX_LED_UP` | Channel LED state | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) |
| `CHX_LED_DOWN` | Channel LED state | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) |
| `CHX_INHIBITED` | Channel inhibited state | Boolean | Boolean |
| `CHX_INHIBITED_UP` | Channel inhibited up state | Boolean | Boolean |
| `CHX_INHIBITED_DOWN` | Channel inhibited down state | Boolean | Boolean |
| `CHX_FORCED_UP` | Channel forced up state | Boolean | Boolean |
| `CHX_FORCED_DOWN` | Channel forced down state | Boolean | Boolean |
| `CHX_LOCKED` | Channel lock state | Boolean | Boolean |
| `CHX_POSITION` | Channel position (%) | Integer | Integer |
| `CHX_UP` | Set channel up for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_DOWN` | Set channel down for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_INHIBIT` | Set channel inhibit for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_INHIBIT_UP` | Set channel inhibit up for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_INHIBIT_DOWN` | Set channel inhibit down for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_FORCE_UP` | Set channel force up for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_FORCE_DOWN` | Set channel force down for specified duration (s) |  | Integer (0 = Cancel, -1 = Indefinitely) |
| `CHX_LOCK` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |

### Counter (`VMB7IN`)
Parameter `X` must be replaced with a counter number (1-4).

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `COUNTERX` | Counter cumulative value | Number | |
| `COUNTERX_RESET` | Counter cumulative reset | | `AttributeExecuteStatus.REQUEST_START` |
| `COUNTERX_INSTANT` | Counter instantaneous value | Number |  |
| `COUNTERX_UNITS` | Counter units value | Text |  |
| `COUNTERX_ENABLED` | Counter enabled state | Boolean | Boolean |

### OLED

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `MEMO_TEXT` | Set the memo text with optional timeout (s); timeout value supplied at end of text as `:N` | | Text (Empty string = Cancel) |


### Analog Input
Parameter `X` must be replaced with a sensor number (1-4).

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `SENSORX` | Sensor value | Number | |
| `SENSORX_TEXT` | Text representation of value with units | Text | |
| `SENSORX_TYPE` | Sensor type | Text (`VOLTAGE`, `CURRENT`, `RESISTANCE`, `PERIOD`) | |
| `SENSORX_MODE` | Sensor mode | Text (`SAFE`, `NIGHT`, `DAY`, `COMFORT`) | Text (`SAFE`, `NIGHT`, `DAY`, `COMFORT`) |

### Analog Output
Parameter `X` must be replaced with a sensor number (1-4).

| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `CHX` | Channel state | Text (`OFF`, `ON`, `LAST`, `HALT`) | Text (`OFF`, `ON`, `LAST`, `HALT`) |
| `CHX_SETTING` | Channel setting | Text (`NORMAL`, `INHIBITED`, `FORCED`, `LOCKED`) | Text (`NORMAL`, `INHIBITED`, `FORCED`, `LOCKED`) |
| `CHX_LOCKED` | Channel lock (forced off) state | Boolean | Boolean |
| `CHX_INHIBITED` | Channel inhibit state | Boolean | Boolean |
| `CHX_FORCED` | Channel forced on state | Boolean | Boolean |
| `CHX_LED` | Channel LED state | Text (`OFF`, `ON`, `SLOW`, `FAST`, `VERYFAST`) |  |
| `CHX_ON` | Set channel on for specified duration (s) |  | Integer (0 = Off) |
| `CHX_LEVEL_AND_SPEED` | Set channel level and ramp speed (s) |  | Text (LEVEL:SPEED) (0 = Halt) |
| `CHX_VALUE_AND_SPEED` | Set channel value and ramp speed (s) |  | Text (LEVEL:SPEED) (0 = Halt) |
| `CHX_LOCK` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_FORCE_OFF` | Set channel locked for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_FORCE_ON` | Set channel forced on for specified duration (s) |  | Integer (0 = Cancel) |
| `CHX_INHIBIT` | Set channel inhibit for specified duration (s) |  | Integer (0 = Cancel) |

### Meteo
| Value | Description | Read | Write |
| ------------- | ------------- | ------------- | ------------- |
| `RAINFALL` | Rainfall value | Number | |
| `WIND` | Rainfall value | Number | |
| `LIGHT` | Rainfall value | Number | |
