# backend based in Google Cloud functions
based on https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/typescript.md

## Getting Started
Install Google Cloud CLI https://cloud.google.com/sdk/docs/install. When asked if you want to set up your account,
do so and follow the steps. Select `wgmi-cc` as the organization/project when prompted.

## Contributing
### Adding a function
1. Create the function code where appropriate inside `src`.
1. Add the function to the set of function definitions/handlers in `src/index.ts`
1. Add the function's deploy script to `package.json` by copying one of the lines named `deploy-xxx` and changing
the name after `deploy` (in both the script name and script command) based on what you put in `src/index.ts`.
1. Add that script to `deploy-all`.
1. Follow instructions below on deploying a function.

## Deploy Functions
Use the appropriate script in `package.json`, e.g. `npm run deploy-hello-world`, or `npm run deploy-all` to deploy
everything.
