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

