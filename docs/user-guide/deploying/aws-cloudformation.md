---
sidebar_position: 3
---

# AWS CloudFormation

The CloudFormation template can be found at [cloudformation-create-vpc.yml](https://github.com/openremote/openremote/blob/master/.ci_cd/aws/cloudformation-create-vpc.yml).

At OpenRemote we use AWS for hosting our deployments, this guide explains how to create and configure AWS EC2 hosts using CloudFormation for running the OpenRemote started with docker compose; it is written from the OpenRemote organisation perspective but can be used to assist in setting up your own AWS hosted infrastructure. Please refer to the AWS documentation for more details on the services/tools mentioned (we don't generally offer AWS support but some kind person may be able to help on the [forum](https://forum.openremote.io).

## AWS services/tools used
To manage the OpenRemote deployments we use the following AWS services/tools:
* CloudFormation - For provisioning of resources EC2 instance, networking, IAMs, etc.
* Route 53 - Hosted domain zone to allow management of deployment DNS records
* VPC - To allow management of network access to deployments
* EC2 - For management of virtual hosts to host the deployments
* EFS - To allow mounting large files into hosts without needing EC2 instances with large HDDs
* SNS - For notifications relating to CloudFormation operations
* S3 - For backups

## AWS management console vs CLI
Interaction with AWS can be done either through the management console UI or using the CLI tool; the UI can be convenient for visualising data or for beginners but the CLI can be more efficient; this guide only discusses the use of the UI to cater for all user levels, it is assumed more advanced users know how to use the CLI to perform the same tasks.

## AWS Signing In
For interactive (UI login) it is recommended to use the [single sign on portal](https://openremote.awsapps.com/start#/), root users should not be used and user accounts should be configured for UI login with the minimal permissions to fulfil their tasks.

For CLI login then an AWS access key ID and secret is needed.

## AWS Region
AWS resources are siloed into datacentre regions; this guide focuses on a single region setup specifically `eu-west-1`; in the UI the region can be selected in the top right.

## Pre-requisites

### AWS IAM
This guide does not give details of IAM setup and it is expected that appropriate users, groups, etc. are in place to provide safe access to AWS services following best practices as recommended by AWS.

### VPC & Security Groups
The default VPC should be configured with the following named `Security Groups`:

* `http-access` - Inbound TCP `80` and `443` from anywhere
* `mqtt-access` - Inbound TCP `8883` from anywhere
* `ping-access` - Inbound ICMP ping from anywhere
* `snmp-access` - Inbound UDP `162` from anywhere
* `ssh-access` - Inbound TCP `22` from specific CIDR blocks (assignment is out of the scope of this guide)

### EC2 Key Pair
A Key Pair called `openremote` must exist as this will be used by provisioned EC2 instances to allow SSH login using the corresponding private key.


### Route 53 Hosted Zone
A Hosted zone should exist for `app.openremote.io`.

### EFS volumes
Re-usable EFS volumes can be pre-created that contain common `mapdata.mbtiles` and should be named based on the map data coverage region for easy identification. Each should be configured so that the availability zones use the `nfs-access` security group to grant access to the resources from the EC2 instances.

### S3
TODO: Explain S3 pre-requisites

## Using the template

Refer to the template for explanation of what it does, input parameters and outputs.
