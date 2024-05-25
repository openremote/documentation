---
sidebar_position: 10
---

# Serial

Connect to a Serial Server.

Make sure that the device mapping for the `manager` docker container in the file `docker-compose.yml` looks like the following:
```
...
...
  manager:
    restart: always
    ...
    ...
    devices:
      - /dev/ttyACM0:/dev/ttyS0
...
...      
```
In this example the serial port `/dev/ttyACM0` of the host is mapped to the serial port `/dev/ttyS0` of the `manager` docker container.

## Agent configuration
The following describes the supported agent configuration attributes:

| Attribute | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `serialPort` | Serial port device address (e.g. `COM1` or `/dev/ttyACM0`) | Text | Y |
| `serialBaudrate` | Serial port baudrate | Integer (Default = `38400`) | N |

As this is a generic IO Agent the optional attributes described in the [Generic Agent Overview](overview.md#generic-agents-io-agents) can also be used.

## Agent link
For attributes linked to this agent, the `Default` [Agent Link](overview.md#agent-links) should be used with a `type` value of `Default`.
