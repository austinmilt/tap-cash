# tap Backend 

tap's Backend has several main components required to run the tap app:

| Protocol | Description | Requirements |
| -------- | ----------- | ------------ |
| [tap On-Chain Program](./program/tap_cash/) | Solana program that manages user accounts and multi-sign USDC wallets | [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)  & [Anchor CLI](https://www.anchor-lang.com/docs/cli)  |
| Google Cloud | Google Cloud Functions based backend that handles user authentication, credit card onramp, and
  other backend services | [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)  & [Google Cloud Account](https://console.cloud.google.com/) |
| Google Firestore | Database for storing user public info | [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)  & [Google Cloud Account](https://console.cloud.google.com/) |
| Circle SDK | Circle SDK for credit card onramp | [Circle Developer Sandbox Account](https://app-sandbox.circle.com/signup) |
| Web3 Auth SDK | Single sign-in with Google and non-custodial signing wallet | [Web3 Auth Developer Account](https://dashboard.web3auth.io/) |

Make sure you have the requirements for each component before proceeding.

Rename `.env.example.yml` to `.env.local.yml` and fill out the environment variables for the correct environment(s).

## tap On-Chain Program
#### Set Up
- Install the Solana CLI https://docs.solana.com/cli/install-solana-cli-tools
- Install the Anchor CLI https://www.anchor-lang.com/docs/cli
- Create a new Solana wallet `solana-keygen new --outfile ~/.config/solana/id.json`
- Set the Solana CLI to use the new wallet and localhost `solana config set --keypair ~/.config/solana/id.json --url localhost`

#### Build the Program
- Open the program directory `cd program/tap_cash`
- Build the program with `anchor build`

#### Deploy the Program
- Launch a local Solana cluster `solana-test-validator -r`
- Airdrop your wallet some SOL `solana airdrop 100` 
- Deploy the program to the local cluster `anchor deploy`
- Your program should now be deployed to the local cluster and you can start interacting with it

## Google Cloud Functions
based on https://github.com/GoogleCloudPlatform/functions-framework-nodejs/blob/master/docs/typescript.md

#### Getting Started
- Install Google Cloud CLI https://cloud.google.com/sdk/docs/install. 
- When asked if you want to set up your account, do so and follow the steps. Select your organization/project as the organization/project when prompted.
- Copy `.env.example.yml` to `.env.local.yml` (and `.env.prod.yml` if you are deploying functions) and fill
out the environment variables for the correct environment(s).

### Contributing
#### Adding a function
1. Create the function code where appropriate inside `src`.
2. Add the function to the set of function definitions/handlers in `src/index.ts`
3. Add the function's deploy script to `package.json` by copying one of the lines named `deploy-xxx` and changing
the name after `deploy` (in both the script name and script command) based on what you put in `src/index.ts`.
4. Add that script to `deploy-all`.
5. Follow instructions below on deploying a function.

##### Deploy Functions
Use the appropriate script in `package.json`, e.g. `npm run deploy-hello-world`, or `npm run deploy-all` to deploy
everything.

The output of the script will tell you the URL of the new/updated function to use for the app to call, e.g.
https://hello-world-7pi36k236a-uc.a.run.app


## Running Functions locally
- Change directory to `backend`: `cd backend`
- `npm run start` to start the functions locally
- Run [sample curl scripts](./src/test-curls) (start with `save-member` to initiate a bank and user account) 


## Devnet Implementation of TAP 
[Program](https://explorer.solana.com/address/TAPAPp2YoguQQDkicGyzTzkA3t4AgECvR1eL1hbx9qz?cluster=devnet): `TAPAPp2YoguQQDkicGyzTzkA3t4AgECvR1eL1hbx9qz`
[USDC](https://explorer.solana.com/address/USDCMGr4yKJju4p6r229yeWmKSsBLicUcZ2T1Ggx9sk?cluster=devnet): `USDCMGr4yKJju4p6r229yeWmKSsBLicUcZ2T1Ggx9sk`
Bank Auth: `BaNkRi9z8s8y93KixtteuLXRxrL8Ph5XaXZs8HEvCda1`
Bank PDA: `61t7eqKRX4y4og7N3viKsNrc6Hp9AMWSa6Ym4jt82g23`