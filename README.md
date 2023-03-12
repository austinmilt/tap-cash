# Tap Cash
Cash transfers using Solana.

## Getting Started

### Install Dependencies
Follow these directions https://reactnative.dev/docs/environment-setup but skip Creating a new application.

In a terminal in the project directory run `npm install`


### Set up Environment
Set your environment `JAVA_HOME` to the location of the JRE, e.g. `"C:\Program Files\Android\Android Studio\jre"`

On Windows, set


### Starting the App
You must have run the setup steps already.

1. Start the backend (/backend) and, if needed, the solana validator (/program).
2. In one terminal, run `emulator -avd Pixel_6_Pro_API_33`. Replace `Pixel_6_Pro_API_33` with whatever AVD you are testing with, or if you're
testing on a physical device, get your physical device connected to `abd`.
3. In a second terminal, start Metro: `npm start-windows` or `npm start`.
Choose one of the options that pop up (probably pressing `a` to run on Android).


### Building the APK (for testing)
Follow all setup steps above.

1. Get the keystore file and app signing password from
one of the Tap devs, to use in the next step.
2. Follow the steps for
[Setting up Gradle Variables](https://reactnative.dev/docs/signed-apk-android#setting-up-gradle-variables),
using the password above for `MYAPP_UPLOAD_STORE_PASSWORD` and `MYAPP_UPLOAD_KEY_PASSWORD`. Do NOT save the variables in `android/gradle.properties` as the secret will be committed to git.
3. In a terminal the repo root directory, run the command for generating the APK
 (see [Testing the release build of your app](https://reactnative.dev/docs/signed-apk-android#testing-the-release-build-of-your-app)):

    ```bash
    # windows
    npm run build-apk-windows

    # unix
    npm run build-apk
    ```

This will create an APK in `android/app/build/outputs/release` which you can then
sideload on your phone or distribute to others for testing.

Note:
- Before installing, you need to uninstall other versions of the
app running on your phone as this will prevent it from being installed.
You will see an error like

    > Execution failed for task ':app:installRelease'.
    > java.util.concurrent.ExecutionException: com.android.builder.testing.api.DeviceException: com.android.ddmlib.InstallException: INSTALL_FAILED_UPDATE_INCOMPATIBLE: Existing package com.tapcash signatures do not match newer version; ignoring!

- This is _not_ the APK you would upload to the app store. See [Generating the release AAB](https://reactnative.dev/docs/signed-apk-android#generating-the-release-aab) for that.
- This process will also open the emulator and run there.
You can close the emulator and other windows.

### Program Info
- PROGRAM: `TAPAPp2YoguQQDkicGyzTzkA3t4AgECvR1eL1hbx9qz`
- BANK: `AU88yciXy2Rz2DJkUUFu2gpYqaPRLngd3sevSfAH8KyS`
