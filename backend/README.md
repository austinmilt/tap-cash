# backend based in Google Cloud functions
based on https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/typescript.md

## Getting Started
Install Google Cloud CLI https://cloud.google.com/sdk/docs/install. When asked if you want to set up your account,
do so and follow the steps. Select `wgmi-cc` as the organization/project when prompted.

Copy `.env.example.yml` to `.env.local.yml` (and `.env.prod.yml` if you are deploying functions) and fill
out the environment variables for the correct environment(s).

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

The output of the script will tell you the URL of the new/updated function to use for the app to call, e.g.
https://hello-world-7pi36k236a-uc.a.run.app


## Running Functions locally
`npm run start` and see the console output for a URL to hit to try it out

Note it only "deploys" one function locally, so either change the script args or run what's in the script
with your custom function.
