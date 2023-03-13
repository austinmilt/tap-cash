# tap app Local Development

To deploy tap locally, you will need to set up the following:
- tap Solana Program (detailed setup and delpoyment instructions [here](./backend/README.md)))
- Backend (detailed setup and delpoyment instructions [here](./backend/README.md))
- Frontend (detailed setup and delpoyment instructions below 

## Front End Set Up

### Install Dependencies
Follow these directions https://reactnative.dev/docs/environment-setup but skip Creating a new application.

In a terminal in the project directory run `npm install`


### Set up Environment
- Set your environment `JAVA_HOME` to the location of the JRE, e.g. `"C:\Program Files\Android\Android Studio\jre"`
- Rename `.env.example` to `.env.local`
- Set environment variables, `WEB3_AUTH_CLIENT_ID` and 
- Set `USDC_MINT_ADDRESS` to the address of the same USDC token mint as `FAKE_USDC_ADDRESS` and `USDC_MINT_ADDRESS` in the [./backend/.env.example.yaml](./backend/.env.example.yaml).


### Starting the App
You must have run the setup steps already.

1. [Start the backend and local validator](./backend/README.md) ([./backend](./backend)).
2. In one terminal, run `emulator -avd Pixel_6_Pro_API_33`. Replace `Pixel_6_Pro_API_33` with whatever AVD you are testing with. Alternatively, you can: 
    - Run a device emulator from Android Studio or
    - If you're testing on a physical device, get your physical device connected to `adb`.
3. In a second terminal, start Metro: `npm start-windows` or `npm start`. Choose one of the options that pop up (probably pressing `a` to run on Android).

The app will start on your emulator or device, and you should see the blue `tap` splash screen.
