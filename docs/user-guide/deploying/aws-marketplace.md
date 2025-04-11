---
sidebar_position: 4
---

# AWS Marketplace

This guide explains how to provision/configure OpenRemote via the AWS Marketplace.
The CloudFormation template can be found at [cloudformation-aws-marketplace.yml](https://github.com/openremote/openremote/blob/master/.ci_cd/aws/cloudformation-aws-marketplace.yml).

# Architecture Diagram
![image](img/or-aws-marketplace-architecture.png)

## Subscribe to the AWS Marketplace
To use OpenRemote through the AWS Marketplace, you need an active subscription. Follow the steps below to subscribe.

- Search for OpenRemote on the [AWS Marketplace](https://aws.amazon.com/marketplace/search/results?searchTerms=openremote) and click on the listing.
- Click the `View purchase` options button.
- Accept the EULA by selecting `Accept Terms`.
- You are now subscribed to the free OpenRemote Marketplace `app`. The subscription process will take a few minutes. Once completed, the `Continue to Configuration` button will become available.
- Click `Continue to Configuration` once the subscription is processed.
- Choose a template version (the latest version is selected by default) and select your preferred AWS `region` for deployment.
- Click `Continue to Launch` after making your selections.
- Review your selections and click `Launch to proceed`. You will be redirected to the AWS `CloudFormation` page.
- On the AWS `CloudFormation` page, click `Next` to continue.

## Instance Configuration
If you are successfully subscribed to the OpenRemote marketplace `app`, you can start configuring it. Below, you will find a detailed description of each parameter available in the template.

* `Hostname` - You can specify the `FQDN (Fully Qualified Domain Name)` you want to use for this OpenRemote instance.  
   If no value is provided, you can access OpenRemote using the public `IPv4` address of the `EC2` instance.

* `Instance Type` - You can choose from the following `t4g` and `m6g` instance types:
  - `t4g.small`
     - vCPU: 2 
     - Memory: 2GB
  - `t4g.medium` 
     - vCPU: 2 
     - Memory: 4GB
  - `t4g.large` 
     - vCPU: 2 
     - Memory: 8GB
  - `m6g.large` 
     - vCPU: 2 
     - Memory: 8GB
  - `m6g.xlarge` 
     - vCPU: 4 
     - Memory: 16GB
  
   Prices vary based on the selected instance. All instances are using the `ARM` architecture.
   For detailed pricing information, visit the pricing pages for [t4g](https://aws.amazon.com/ec2/instance-types/t4/) and [m6g](https://aws.amazon.com/ec2/instance-types/m6g/).

* `Storage` - You can specify the amount of block storage to provision for this OpenRemote instance, with options of `8GB`, `16GB`, `32GB`, `48GB` and `64GB`.
   It is possible to expand the volume after instance creation, but a reboot will be required.

* `key pair` - Choose a `key pair` for this OpenRemote instance. With the selected `key pair` you can `SSH` into the machine.
  You can only select an `key pair` that were created in the **same** region as where you want to deploy the OpenRemote instance.

   :::tip
   
   To create a new `key pair`, follow the steps provided [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html).

   :::

   :::danger

   After creating the `key pair`, you receive a private key. \
   Make sure to save this file on a secure location, as you will not be able to `SSH` into the machine without it.

   If you accidentally lose your key, follow the steps provided [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/replacing-key-pair.html) to recover access to your instance.

   :::

* `Elastic IP` - You can choose whether to assign an `Elastic IP` to this OpenRemote instance. Enabling this option ensures that your `IPv4` address remains the same after `rebooting` or `stopping` the instance. 
   Additional charges may apply, visit the pricing page [here](https://aws.amazon.com/vpc/pricing/).

## OpenRemote Configuration (Optional)

* `Password` - You can override the default password for this OpenRemote instance by providing a custom password. \
  There are no specific requirements for this password.

## E-mail Configuration (Optional)

* `SMTP Hostname` - You can specify the `Hostname` that will be used for sending e-mails. (e.g. mail.example.com).
* `SMTP Username` - You can specify the username for authenticating with the `SMTP` server. In most cases this is the e-mail address of the sending account.
* `SMTP Password` - You can specify the password for authenticating with the `SMTP` server.
* `SMTP Sending address` - You can specify the e-mail address that will be used as the sending address. The e-mail address is visible for the receivers. (e.g. no-reply@example.com).

## Unsubscribe from the AWS Marketplace
To stop using the OpenRemote AWS Marketplace `app`, you can unsubscribe by following the steps below.

-  Visit the AWS Markerplace subscriptions page by clicking [here](https://us-east-1.console.aws.amazon.com/marketplace/home#/subscriptions).
-  Find the OpenRemote subscription in the list and click on it.
-  Click the `Actions` button, then select `Cancel Subscription`.
-  A modal pops up asking you to confirm the cancellation of the subscription.
-  To confirm cancellation, type `confirm` in the designated input field and click the `Cancel Subscription` button.

:::note

To cancel the subscription, you must first delete any stacks created with it.

:::