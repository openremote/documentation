---
sidebar_position: 4
---

# OpenRemote CLI

The ```openremote-cli``` (or ```or``` for short) is a command line tool that can be used for deploying the OpenRemote stack, note that this tool is still in `beta`.

Prerequisites: 

- `docker`
- `python`
- `docker-compose`
- `aws-cli`

In case of using the prebuilt `openremote/openremote-cli` docker image, only `docker` is needed.  

### Install
```bash
pip3 install -U openremote-cli
openremote-cli -V
```

There is also docker image provided:

```bash
docker run --rm -ti openremote/openremote-cli <command>
```

Note that the image ENTRYPOINT is set to the openremote-cli command (the same way as amazon/aws-cli docker image) therefore ```docker run --rm -ti openremote/openremote-cli -V``` is equivalent to ```openremote-cli -V```.

### Deploy on localhost

```bash
or deploy --action create
```
using docker
```bash
docker run --rm -ti -v /var/run/docker.sock:/var/run/docker.sock openremote/openremote-cli deploy
```
### Deploy on AWS

Prerequisites:

  - [aws-cli](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
  - `openremote-cli` AWS profile. If you have Id and AWS secret key, you can use following command:
  ```bash
  or configure_aws --id <id> --secret <secret> -v
  ```
  At the moment the default region must be set to eu-west-1 (Ireland), this is done by the `openremote-cli`. This can be changed using *aws-cli* (not recommended):
  ```bash
  aws configure --profile=openremote-cli
  ```
  
Deploy the stack:
```bash
or deploy --provider aws --dnsname test.mvp.openremote.io -v
```
Remove the stack and clean resources:
```bash
or deploy -a remove --provider aws --dnsname test.mvp.openremote.io -v
```

### Check health of running manager

```bash
or deploy -a health -v
or deploy -a health --dnsname demo.openremote.io -v
```

### Configure manager

```
> or manager --list-realms --login -q -t

Listing realms
--------------
master          Master
smartcity       Smart City
```
To check (growing) list of commands:
```
> or manager -h
usage: openremote-cli manager [-h] [-V] [-n] [-v] [-t] [-q] [-u USER] [-p PASSWORD] [--dnsname DNSNAME] [--list-realms] [--list-users]
                              [--list-public-assets] [--create-user] [--delete-user] [--realm REALM] [--login]

manage online manager

optional arguments:
  -h, --help            show this help message and exit
  -V, --version         show program's version number and exit
  -n, --dry-run         showing effects without actual run and exit (default: False)
  -v, --verbosity       increase output verbosity (default: 0)
  -t, --no-telemetry    Don't send usage data to server (default: False)
  -q, --quiet           suppress info (default: False)

manager arguments:
  -u USER, --user USER  username (default: admin)
  -p PASSWORD, --password PASSWORD
                        user password (default: None)
  --dnsname DNSNAME     OpenRemote dns (default: demo.openremote.io)
  --list-realms         list defined realms (default: False)
  --list-users          list defined users in a realm (default: False)
  --list-public-assets  list public assets in a realm (default: False)
  --create-user         create users in a realm (default: False)
  --delete-user         delete users from a realm (default: False)
  --realm REALM         realm to work on (default: master)
  --login               login into manager (default: False)
```
