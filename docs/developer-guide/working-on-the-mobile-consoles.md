---
sidebar_position: 11
---

# Working on the mobile consoles

The OpenRemote mobile consoles load the web applications using a web view and provide bridging of native device functionality to provide a native app experience. Make sure you've pulled the latest code of the repository.

## Android Console

Download and install [Android Studio](https://developer.android.com/studio/index.html), then open the `console/android` project. 

TODO: There is actually nothing to build right now, you have to create a custom project and a dependency on our Android console project from your own Android app. 

## iOS Console

### Developing for iOS is only possible on macOS.

Download and install [Xcode](https://itunes.apple.com/nl/app/xcode/id497799835)

Open Xcode and create a new project. In the generals part, click on the plus symbol to add a new target. Select Notification Service Extension. Close the project. 


Install cocoapods through a terminal window.
```
sudo gem install cocoapods
```
Navigate to your project directory and create a pod file.
```
pod init
```

Open up the Podfile with a text editor. Add the `ORLib` pod to both of the targets
```
workspace '<your_project>'
platform :ios, '11.2'

use_frameworks!

def shared_pods
  pod 'Firebase/Core', '~> 4.6.0'
  pod 'Firebase/Messaging', '~> 4.6.0'
  pod 'Fabric', '~> 1.10.2'
  pod 'Crashlytics', '~> 3.13.4'
end


target '<your_project>' do
  project '<your_project>'
  shared_pods
end

target 'NotificationService' do
  project '<your_project>'
  shared_pods
end

target 'ORLib' do
  project 'path_to/openremote/console/iOS/ORLib/ORLib'
  shared_pods
end

```
Save and close the Podfile.
In the terminal enter the following command
```
pod install
```
A xcworkspace file is created after installing the pod. Open this file and Xcode will start.

Click on the `Pods` icon in the project tree and then on ORLib in the targets pane. Search for Require Only App-Extension-Safe API and set it to `No`. A warning will appear which can be ignored.

Open `AppDelegate` in your project and make it inherit from `ORAppDelegate`. Remove all the code and override `applicationDidFinishLaunchingWithOptions`. Set the right project values.
```
override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {

        ORServer.hostURL = "example.com"
        ORServer.realm = "example"

        ORAppGroup.entitlement = "group.io.openremote.example"
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
```

In the `Main.storyboard` add a second ViewController. The initial viewcontroller should be of class ORLoginViewController. The other ViewController should be of class ORViewController.

In the Notification Service Extension target, open `NotificationViewController` and make it inherit from `ORNotificationService`. Remove all the code inside.

When using Firebase, download the GoogleService-Info.plist and add it through Xcode. It shuld be placed in the root of the project. Make sure that `copy when needed` is checked when adding.

Now your iOS app is setup to work with your OpenRemote project!

.
## Push Notifications / FCM setup

Our consoles are able to receive push notifications that are sent by the OpenRemote Manager.<br />
Through Firebase, together with the use of FCM tokens, you can set this up for your own project using your own account.<br />
*(steps are unverified)*

### Setup Firebase and client

1. Create a new Firebase Project at https://console.firebase.google.com using either a free or paid plan.
2. When on the 'Project Overview' page, create a new app for your preferred platform; such as Android and iOS.
3. Fill in the correct details for your app, and follow the steps respectively. These should be no different than any other Android/iOS app.

After your config files are placed in the correct folder, (normally `google-services.json` and `GoogleService-info.plist`)<br />
and the Firebase Gradle dependencies have been added to your project, you are good to go!

### Configure Manager to send push notifications

To complete the setup process, you should configure the manager to send push notifications to the correct address on Firebase.<br />

> Be sure that the `OR_FIREBASE_CONFIG_FILE` environment variable is set to the correct path.<br />
> Forks of OpenRemote should be correctly configured, but custom projects might need additional attention.<br />
> We normally use `/deployment/manager/fcm.json`.

1. Go to your Firebase project at https://console.firebase.google.com
2. Using the gear icon on the left menu, you can open the 'Project settings'. Open it and go to the 'Service accounts' tab.
3. Generate a new private key for your preferred account; the button will prompt a JSON file download. Store this safely.
4. In your project repository, place the JSON file inside the `/deployment/manager` folder, and rename it to `fcm.json`.

Now you should be set up to send notifications!<br />
You can send these programmatically, or by using the Rules feature in the OpenRemote Manager.

### Encrypt Firebase files in your repository (optional, but recommended)

For most projects, you want to keep Firebase related files secret for security reasons.<br />
We have built-in gradle scripts to help you with this;

1. Open to the `build.gradle` file in the root of your repository.
2. Add/replace the paths specified in the `gradleFileEncrypt` task with the files you want to encrypt.<br />
Normally this is your `fcm.json` file, but also the files related to the consoles like `google-services.json`.
3. Double check whether these files you want to encrypt are present in your `.gitignore` files. **This is required.**
4. Generate/specify a password to encrypt the files with, by using the `GFE_PASSWORD` environment variable. Save this somewhere safe.
5. Run the `./gradlew encryptFiles` task

You are now set up!

*To decrypt the files again, you can use the `./gradlew decryptFiles` command.<br />*
