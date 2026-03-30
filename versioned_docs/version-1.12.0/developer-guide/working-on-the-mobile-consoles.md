---
sidebar_position: 11
---

# Working on the mobile consoles

The OpenRemote mobile consoles load the web applications using a web view and provide bridging of native device functionality to provide a native app experience.
Make sure you've pulled the latest code of the repository.

## Android Console

Download and install [Android Studio](https://developer.android.com/studio/index.html)

Open Android Studio and create an Android app.
In your application gradle file, add the following dependency
```groovy
implementation 'io.openremote:orlib:1.3.0'
```

Open your `MainActivity` and make it inherit `OrMainActivity`.  
Implement the additional logic to set the proper URL and trigger the load, such as
```kotlin
class MainActivity() : OrMainActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val platform = "Android " + Build.VERSION.RELEASE
        val version = BuildConfig.VERSION_NAME
        baseUrl = "https://example.com/myapp/?consolePlatform=$platform&consoleName=mygrid&consoleVersion=$version&consoleAutoEnable=false&consoleProviders=push storage"
        loadUrl(baseUrl!!)
    }
}
```

When using Firebase, download the `google-services.json` file and add it to you project.  
Follow the Firebase [instructions](https://firebase.google.com/docs/android/setup).

## iOS Console

### Developing for iOS is only possible on macOS

Download and install [Xcode](https://itunes.apple.com/nl/app/xcode/id497799835)

Open Xcode and create a new iOS App project. Select `Storyboard` as the "Interface".

In the project navigator, open the contextual menu and select "Add Package Dependencies…".  
Search for URL https://github.com/openremote/console-ios-lib.git then click "Add Package" and again in the "Choose Package Products" window.  
Repeat for URL https://github.com/hackiftekhar/IQKeyboardManager.git.  
Repeat for URL https://github.com/AssistoLab/DropDown.git but here select "Dependency Rule" `Branch` and enter `master` for the branch name.  
Repeat for URL https://github.com/firebase/firebase-ios-sdk.git but in the "Choose Package Products" window select set the target only for FirebaseAnalytics, FirebaseCrashlytics and FirebaseMessaging.

Open `ViewController` and make it inherit `ORViewController` instead of `UIViewController` (you'll need to import module `ORLib`).  
Implement the additional logic to set the proper URL and trigger the load, such as
```swift
class MainViewController: ORViewcontroller {
    override func viewDidLoad() {
        super.viewDidLoad()
        self.baseUrl =  "https://example.com/myapp/?consolePlatform=iOS \(UIDevice.current.systemVersion)&consoleName=myconsole&consoleVersion=\(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "N/A")&consoleProviders=push storage"
        if let encodedUrl = self.baseUrl!.addingPercentEncoding(withAllowedCharacters: .urlFragmentAllowed) {
            loadURL(url: URL(string: encodedUrl)!)
        }
    }
}
```

In the generals part, click on the plus symbol to add a new target.  
Select Notification Service Extension.  
Don't activate the scheme.  

When using Firebase, download the `GoogleService-Info.plist` file and add it through Xcode.  
Follow the Firebase [instructions](https://firebase.google.com/docs/ios/setup).

Now your iOS app is setup to work with your OpenRemote project!

## Push Notifications / FCM setup

Our consoles are able to receive push notifications that are sent by the OpenRemote Manager.

Through Firebase, together with the use of FCM tokens, you can set this up for your own project using your own account.  
See above for the console specific steps.

### Configure Manager to send push notifications

To complete the setup process, you should configure the manager to send push notifications to the correct address on Firebase.

> Be sure that the `OR_FIREBASE_CONFIG_FILE` environment variable is set to the correct path.  
> Forks of OpenRemote should be correctly configured, but custom projects might need additional attention.  
> We normally use `/deployment/manager/fcm.json`.

1. Go to your Firebase project at https://console.firebase.google.com
2. Using the gear icon on the left menu, you can open the 'Project settings'. Open it and go to the 'Service accounts' tab.
3. Generate a new private key for your preferred account; the button will prompt a JSON file download. Store this safely.
4. In your project repository, place the JSON file inside the `/deployment/manager` folder, and rename it to `fcm.json`.

Now you should be set up to send notifications!

You can send these programmatically, or by using the Rules feature in the OpenRemote Manager.

### Encrypt Firebase files in your repository (optional, but recommended)

For most projects, you want to keep Firebase related files secret for security reasons.

We have built-in gradle scripts to help you with this;

1. Open to the `build.gradle` file in the root of your repository.
2. Add/replace the paths specified in the `gradleFileEncrypt` task with the files you want to encrypt.  
   Normally this is your `fcm.json` file, but also the files related to the consoles like `google-services.json`.
3. Double check whether these files you want to encrypt are present in your `.gitignore` files. **This is required.**
4. Generate/specify a password to encrypt the files with, by using the `GFE_PASSWORD` environment variable. Save this somewhere safe.
5. Run the `./gradlew encryptFiles` task

You are now set up!

*To decrypt the files again, you can use the `./gradlew decryptFiles` command.*
