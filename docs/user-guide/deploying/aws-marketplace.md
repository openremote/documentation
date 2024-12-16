# AWS Marketplace

We have created an app for the AWS Marketplace to make deployment easier. This guide describes how to configure the instance using the special AWS CloudFormation template.

## Subscribe to the AWS Marketplace app
1. Search for OpenRemote on the [AWS Marketplace](https://aws.amazon.com/marketplace) and click on the listing.
2. Click on the orange button 'View purchase options'.
3. Accept the EULA by pressing the 'Accept Terms' button
4. You're now subscribed to the free OpenRemote Marketplace app. It will take a couple of minutes to process your subscription. After that, the 'Continue to Configuration' button becomes available.
5. When the subscription is fully processed, click on the 'Continue to Configuration' button.
6. Select a software version (By default, the latest version is already selected) and choose in which AWS region you want to deploy the software.
7. After selecting the options, press the 'Continue to Launch' button
8. Review your choices and press the 'Launch' button. You will now be redirected to the AWS CloudFormation page.
9. Then the AWS CloudFormation page is displayed, press the 'Next' button.

## Instance Configuration
Now we're successfully subscribed to the OpenRemote marketplace app, we can start configuring it. In the section below, you will find a detailed description of each AWS CloudFormation parameter that's available in the template.

#### `Stack Name`
This can be anything and is used for recognizing the CloudFormation Stack. The Stack name must be 1 to 128 characters, start with a letter, and only contain alphanumeric characters.


#### `Instance Name`
This name is used for recognizing the (OpenRemote) EC2 instance on the overview page.

#### `Instance Type`
You can choose an instance based on your monthly budget. There are three options available:
- `t4g.small` - `2 vCPU` / `2 GB RAM` - around $10 dollars
- `t4g.medium` - `2 vCPU` / `4 GB RAM` - around $25 dollars
- `t4g.large` - `2 vCPU` / `8 GB RAM` - around $50 dollars

#### `Hostname`
You can fill in the `FQDN (Fully Qualified Domain Name)` that you want to use for this OpenRemote instance. If no value is submitted, you can access the software via the public `IPv4 address` from the EC2 instance.

Please note: The software is not using `Amazon Route53` for DNS management. This means that – when you want to use a custom hostname – you manually need to set an A-record pointing to the `IPv4` address of the EC2 instance.

#### `Keypair`
Choose a `keypair` for SSH Access. The `keypair` must exist in the same AWS region where you want to deploy the software. 
Information on how to create a new `keypair` can be found [here](https://eu-central-1.console.aws.amazon.com/ec2/home?region=REGION#KeyPairs:).

#### `SSHLocation`
For security reasons, SSH is blocked by default on all IP addresses. In this field, you can fill in an `IPv4 address` on which you want to enable SSH access.

Please make sure you are using the following notation:
`0.0.0.0/32` allow one specific IP address access, or `0.0.0.0/0` allows all IP address access.

#### `CIDRBlock`
The default (web) ports `80` and `443` are blocked by default for security reasons.
In this field, you can fill in an `IPv4` address on which you want to enable these ports.

Please make sure you are using the following notation:
`0.0.0.0/32` allow one specific IP address access, or `0.0.0.0/0` allows all IP address access.

## OpenRemote Configuration

#### `Password`
Create a password for your OpenRemote instance. This password is used for the administrator account.
The password must meet the following conditions:
- The minimum length is eight characters
- Must have at least one special character

#### `Map tiles`
The software uses a small portion from the city of Rotterdam by default. You can change this by providing a publicly accessible URL where the system can download your custom map tiles (.mbtiles) 

More information about getting (custom) map tiles can be found [here](https://docs.openremote.io/docs/developer-guide/working-on-ui-and-apps/).

#### `Map settings`
Before the system can use your custom map, it needs to know what the boundaries (coordinates) are and where the center of the map is.
You must change these details in the `mapsettings.json` file. After that, you can provide a publicly accessible URL where the system can download this file.

An example file can be found [here](https://github.com/openremote/openremote/blob/master/manager/src/map/mapsettings.json).

## E-mail Configuration

#### `SMTPHost`
Provide the `SMTP` hostname that you want to use for sending e-mails.

#### `SMTPUser`
Provide the `SMTP` username that you want to use for sending e-mails.

#### `SMTPPassword`
Provide the `SMTP` password that corresponds to the hostname and user.

#### `SMTPPort`
The system is using port `587 (TLS)` by default for sending e-mails. If you want to use something else, for example, `465 (SSL)`, You can change it here.

#### `SMTPFrom`
Provide the e-mail address that you want to use for sending e-mails. The e-mail address must be accessible by the `SMTP` host.

## Update OpenRemote

1. Access the AWS Systems Manager via your AWS Console (note the region)
2. Under Node Tools, press **Run Command**, then **Run command** again
3. Search for `docker` and select the **OpenRemote-UpdateDocumentImagesDocument-xxxxxxxxxxxx**
4. Scroll down to the **Target** selection section, select **Choose instances manually**, and select the OpenRemote instance
5. Press the **Run** button at the bottom of the page
6. The next page will show the status of the command, and the below once the command has run successfully and any messages
7. Clicking on the Instance ID will show the output of the commands

## Update Packages

1. Access the AWS Systems Manager via your AWS Console (note the region)
2. Under Node Tools, press **Run Command**, then **Run command** again
3. Search for `packages` and select the **OpenRemote-UpdatePackagesDocument-xxxxxxxxxxxx**
4. Scroll down to the **Target** selection section, select **Choose instances manually**, and select the OpenRemote instance
5. Press the **Run** button at the bottom of the page
6. The next page will show the status of the command, and the below once the command has run successfully and any messages
7. Clicking on the Instance ID will show the output of the commands