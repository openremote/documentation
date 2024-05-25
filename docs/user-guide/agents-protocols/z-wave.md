---
sidebar_position: 15
---

# Z-Wave

Connect to a Z Wave network via a USB stick (tested with [Aeotec Z-Stick Gen5](https://aeotec.com/z-wave-usb-stick)), this protocol requires a `device` mapping for the `manager` docker container to provide access to the USB stick.

Make sure that the device mapping and the volume configuration for the `manager` docker container in the file `docker-compose.yml` looks like the following:
```
...
...
volumes:
  proxy-data:
  manager-data:
  postgresql-data:
  zwave-data:
...
...
  manager:
    restart: always
    ...
    ...
    volumes:
      ...
      ...
      - zwave-data:/zwave
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
| `serialPort` | Serial port address | Text (`/dev/ttyS0`) | Y |

## Agent link
For attributes linked to this agent, the following describes the supported agent link fields which are in addition to the standard [Agent Link](overview.md#agent-links) fields:

| Field | Description | Value type | Required |
| ------------- | ------------- | ------------- | ------------- |
| `type` | Agent type | Text (Must be `ZWaveAgentLink`) | Y |
| `deviceNodeId` | Device node ID | Integer | Y |
| `deviceEndpoint` | Device Endpoint | Integer | Y |
| `deviceValue` | The device value to link to this attribute | Text | Y |

## Discovery and Import
To understand discovery and import refer to [Agent and Asset Discovery/Import](overview.md#agent-and-asset-discoveryimport). This protocol supports the following:

* Protocol Asset Discovery

You can repeat this procedure as often as you want and devices are not imported more than once. You should execute this procedure initially and after you've added a new device to the Z-Wave network.


**TODO: Clean up the following**

## Include Z-Wave devices

This procedure describes how to add a new device to the Z-Wave network (Z-Wave device inclusion). 

Note that before you are able to execute this procedure you have to execute the `Import Z-Wave Devices` procedure at least once otherwise the `Z-Wave Controller` asset is missing.

1. Select `Z-Wave Controller` in the asset list on the left side
2. Activate the `Device Inclusion` checkbox  
3. Put the Z-Wave device into inclusion mode (see device manual)
4. Execute the `Import Z-Wave Devices` procedure in order to add the new device to the asset list on the left side

## Exclude Z-Wave devices

This procedure describes how to remove a device from the Z-Wave network (Z-Wave device exclusion). 

Note that before you are able to execute this procedure you have to execute the `Import Z-Wave Devices` procedure at least once otherwise the `Z-Wave Controller` asset is missing.

1. Select `Z-Wave Controller` in the asset list on the left side
2. Activate the `Device Exclusion` checkbox   
3. Put the Z-Wave device into exclusion mode (see device manual)

## Configure Z-Wave device parameters

1. Select the Z-Wave device in the asset list on the left side and and expand it so that you see the `Parameters` group 
2. Expand the `Parameters` group
3. Select the Z-Wave parameter on the left side 
4. Edit the selected Z-Wave parameter on the right side. To get information about the selected Z-Wave parameter read the text in the `Description` attribute on the right side. The attribute with the disabled `Write` button shows the current Z-Wave parameter value. All other attributes with an enabled `Write` button are used to modify the Z-Wave parameter value. In case of a battery powered device you have to wakeup the device (see device manual) so that the configured parameter value can be sent to the device.


## Additional info
Unfortunately, `Docker for Windows` and `Docker for Mac` do not support device pass through. In case of a Windows or Mac computer you have to install Linux as a virtual machine by means of VirtualBox. There are two options to do this.     

### Windows - Option 1 (Docker Toolbox) 

1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
2. Download and install [VirtualBox Extension Pack](https://www.virtualbox.org/wiki/Downloads)
3. On Windows 10 open the `Windows Features` window and make sure that the following features have **not** been selected: `Hyper-V`, `Virtual Machine Platform`, `Windows Subsystem for Linux`.   
4. Install [Docker Toolbox](https://docs.docker.com/toolbox). Select the following optional components: `Docker Compose for Windows` and `Git for Windows`. Do not select and install `VirtualBox`.
5. Start `Git Bash` and type the following command:
```
docker-machine create --driver virtualbox --virtualbox-boot2docker-url https://github.com/boot2docker/boot2docker/releases/download/v18.06.1-ce/boot2docker.iso default
```
Note that if a virtual machine with the name `default` already exists you can delete it with the following command:
```
docker-machine rm default
```         
6. Start VirtualBox and select the virtual machine with the name `default` on the left side and go to Settings -> Network -> Adapter 1 -> Advanced -> Port Forwarding
7. Add the following rules:

 | Name | Protocol | Host IP | Host Port | Guest IP | Guest Port |
 | --- | --- | --- | --- | --- | --- |
 |postgresql|TCP||5432||5432|
 | keycloak | TCP |  | 8081 |  | 8081 |
 | map | TCP |  | 8082 |  | 8082 |
 | proxy http | TCP |  | 80 |  | 80 |
 | proxy https | TCP |  | 443 |  | 443 |

8. Connect the Aeotec Z-Stick to the PC
9. In VirtualBox go to Settings -> USB
   * Activate `Enable USB Controller`
   * Select `USB 2.0 (EHCI) Controller`
   * Press the `Add USB-Filter` button and select the Aeotec Z-Stick device (Sigma Designs, Inc.)
10. Find out the serial port name. In VirtualBox start the virtual machine with the name `default` on the left side and press the start button. In the boot2docker terminal window type the following command:
```
ls -al /dev/tty* | more
```
In case of a Aeotec Z-Stick Gen5 the USB device name is usually `/dev/ttyACM0`. The older Aeotec Z-Stick S2 has usually the name `/dev/ttyUSB0`.        

### Mac - Option 1 (Docker Toolbox) 

1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
2. Download and install [VirtualBox Extension Pack](https://www.virtualbox.org/wiki/Downloads)
3. Install [Docker Toolbox](https://docs.docker.com/toolbox).
4. Start a terminal and execute the following command:
```
docker-machine create --driver virtualbox --virtualbox-boot2docker-url https://github.com/boot2docker/boot2docker/releases/download/v18.06.1-ce/boot2docker.iso default
```
Note that if a virtual machine with the name `default` already exists you can delete it with the following command:
```
docker-machine rm default
```     
5. Start VirtualBox and select the virtual machine with the name `default` on the left side and go to Settings -> Network -> Adapter 1 -> Advanced -> Port Forwarding
6. Add the following rules:

 | Name | Protocol | Host IP | Host Port | Guest IP | Guest Port |
 | --- | --- | --- | --- | --- | --- |
 |postgresql|TCP||5432||5432|
 | keycloak | TCP |  | 8081 |  | 8081 |
 | map | TCP |  | 8082 |  | 8082 |
 | proxy http | TCP |  | 80 |  | 80 |
 | proxy https | TCP |  | 443 |  | 443 |

7. Connect the Aeotec Z-Stick to the PC
8. In VirtualBox go to Settings -> Ports -> USB
   * Activate `Enable USB Controller`
   * Select `USB 2.0 (EHCI) Controller`
   * Press the `Add USB-Filter` button and select the Aeotec Z-Stick device (Sigma Designs, Inc.)
9. Find out the USB device name in the boot2docker virtual machine. In VirtualBox start the virtual machine with the name `default` on the left side and press the start button. In the boot2docker terminal window type the following command:
```
ls -al /dev/tty* | more
```
In case of a Aeotec Z-Stick Gen5 the USB device name is usually `/dev/ttyACM0`. The older Aeotec Z-Stick S2 has usually the name `/dev/ttyUSB0`.        

### Windows & Mac - Option 2 (Ubuntu VM)

1. Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) 
2. Download and install [VirtualBox Extension Pack](https://www.virtualbox.org/wiki/Downloads)     
3. Download [Ubuntu Desktop](https://ubuntu.com/download/desktop)
4. Start VirtualBox and create a new virtual machine by clicking the `New` button on the top toolbar.    
5. Make the following changes as VirtualBox guides you through a wizard:   
   * Type: `Linux`
   * Version: `Ubuntu (64-bit)`
   * Memory size: Minimum `4096 MB`
   * Virtual hard disk size: Minimum `20 GB`
6. Click the `Start` button in the top toolbar and select the Ubuntu iso image that you've downloaded in step #3 in order to install Ubuntu
7. After installing Ubuntu it's recommended to install 'guest additions'. Start the Ubuntu virtual machine and in the upper menu bar select the following: Devices -> Insert Guest Additions CD image... 
8. Install [Docker Engine](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
9. Install [Docker Compose](https://docs.docker.com/compose/install/)
10. Shutdown the Ubuntu virtual machine and connect the Aeotec Z-Stick to the PC. In the VirtualBox Manager go to Settings -> Ports -> USB -> Port1 and add the following configuration:
    * Activate `Enable USB Controller`
    * Select `USB 3.0 (xHCI) Controller`
    * Press the `Add Filter` button and select the Aeotec Z-Stick USB device (Sigma Designs, Inc.) 
11. Find out the serial port name. Run the following command:
```
dmesg -w
```
You should see something like the following:
```
[15624.940828] cdc_acm 2-1:1.0: ttyACM0: USB ACM device
```
In this example the resulting serial port name would be:
```
/dev/ttyACM0
``` 
### Linux

1. Install [Docker Engine](https://docs.docker.com/engine/install/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/) 
3. Find out the serial port name. Connect the Aeotec Z-Stick to the PC and execute the following command:
```
dmesg -w
```
You should see something like the following:
```
[15624.940828] cdc_acm 2-1:1.0: ttyACM0: USB ACM device
```
In this example the resulting serial port name would be:
```
/dev/ttyACM0
```
