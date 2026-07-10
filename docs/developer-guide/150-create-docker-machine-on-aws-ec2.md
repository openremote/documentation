---
unlisted: true
---

# Create Docker machine on AWS EC2

### Install Docker machine in AWS EC2 instance
You will need to install AWS CLI in order to do this.

```shell
$ docker-machine create --driver amazonec2 --amazonec2-access-key AKIA**** --amazonec2-secret-key **** aws
$ eval $(docker-machine env aws)
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
```

### Setup VPN tunnel to the Docker machine
https://blog.ambar.cloud/tutorial-set-up-openvpn-with-docker-compose/

#### Create OpenVPN config dir
```shell
docker-machine ssh aws mkdir openvpn-docker
```

#### Create docker-compose.yml with the following

```yaml
version: '2'
services:
  openvpn:
    cap_add:
     - NET_ADMIN
    image: kylemanna/openvpn
    container_name: openvpn
    ports:
     - "1194:1194/udp"
    restart: always
    volumes:
     - /home/ubuntu/openvpn-docker:/etc/openvpn
```

#### Fetch OpenVPN Docker image

```shell
docker-compose run --rm openvpn ovpn_genconfig -u udp://aws
```

#### Generate certificates

```shell
docker-compose run --rm openvpn ovpn_initpki
```

#### Start OpenVPN container

```shell
$ docker-compose up -d openvpn
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS                    NAMES
09934f3f52b2        kylemanna/openvpn   "ovpn_run"          6 seconds ago       Up 4 seconds        0.0.0.0:1194->1194/udp   openvpn
```

#### Generate certificate for a client

```shell
docker-compose run --rm openvpn easyrsa build-client-full client nopass
```

#### Get config to local machine

```shell
docker-compose run --rm openvpn ovpn_getclient client > aws.ovpn
```

#### Import config to your OpenVPN client (Tunnelblick on Mac)
right click on aws.ovpn in finder and Open With -> Tunnelblick.app

#### Add IP address of your aws machine to /etc/hosts (might need to sudo this)

```shell
sudo sh
echo $(docker-machine ip aws-mql) aws-mql >> /etc/hosts
```

#### Before you can connect to the OpenVPN server you need to open the OpenVPN inbound port on the AWS EC2 instance
- log into AWS console
- go to EC2 dashboard/Security Groups/docker-machine select Inbound
- add Custom UDP rule - protocol UDP, port 1194, source 0.0.0.0/0
- add also HTTP (80), HTTPS (443) port for manager, 8081 (Keycloak) and 5432 PostgreSQL.
- set in demo.yml IDENTITY_NETWORK_HOST: aws (or IP address of the AWS machine)

#### Now you should be able to connect Tunnelblick with the OpenVPN server, however before you do this add the default VirtualBox IP to it.
```shell
docker-machine ssh aws
sudo vi /etc/network/interfaces
```
#### Insert the following
```
auto eth0:1
iface eth0:1 inet static
address 192.168.99.100
netmask 255.255.255.0
```

#### Restart networking

```shell
sudo /etc/init.d/networking restart
```

#### Now you should see the following interface on the aws instance

```shell
$ ifconfig
...
eth0:1    Link encap:Ethernet  HWaddr 0e:9b:63:c2:cc:54
          inet addr:192.168.99.100  Bcast:192.168.99.255  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:9001  Metric:1
```

#### It is time to open the Tunnelblick connection and you should be able to ping 192.168.99.100

```shell
$ ping 192.168.99.100
PING 192.168.99.100 (192.168.99.100): 56 data bytes
64 bytes from 192.168.99.100: icmp_seq=0 ttl=63 time=113.606 ms
```

Now you can use the AWS EC2 instance as a local VirtualBox Docker machine. This will save your local resources.
It is compatible with current free Tier offer, so you can have it 12 months for free.
