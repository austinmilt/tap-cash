import { CircleEnvironments } from "@circle-fin/circle-sdk";
import * as yamlenv from "yamlenv";
import * as anchor from "@project-serum/anchor";
import { web3, Program, workspace } from '@project-serum/anchor';
import { TapCash } from "./types/tap-cash";


// For loading yaml variables locally. In deployed functions (on GCP), the envs are set in the node process
// during deployment
yamlenv.config({path: ".env.local.yml"});

export const CIRCLE_API_KEY: string = parseEnv("CIRCLE_API_KEY", process.env.CIRCLE_API_KEY);

export const CIRCLE_ENVIRONMENT: CircleEnvironments = parseEnv(
    "CIRCLE_ENVIRONMENT",
    process.env.CIRCLE_ENVIRONMENT,
    CircleEnvironments.sandbox,
    v => {
        if (v === "production") return CircleEnvironments.production;
        else if (v === "sandbox") return CircleEnvironments.sandbox;
        else throw new Error(`Invalid value for CIRCLE_ENVIRONMENT: ${v}`)
    }
);

function parseEnv<T>(
    name: string,
    value: string | undefined,
    defaultValue?: T | undefined,
    transform: (v: string) => T = castString
): T {
    let result: T;
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new Error(`Missing required env variable ${name}.`);

        } else {
            result = defaultValue;
        }
    } else {
        result = transform(value);
    }
    return result;
}


function castString<T>(value: string): T {
    return value as T;
}

export interface WorkSpace {
    connection: web3.Connection;
    provider: anchor.AnchorProvider;
    program: Program<TapCash>;
}

export const getWorkspace = async(): Promise<WorkSpace> => {
    const program = await workspace.TapCash as Program<TapCash>;
    //TODO add endpoint logic
    const connection = new web3.Connection(''); 
    // TODO FIX .env
    const anchorWallet = new anchor.Wallet(web3.Keypair.fromSecretKey(new Uint8Array(process.env.BANK_KEY))); 
    const provider: anchor.AnchorProvider = new anchor.AnchorProvider(
        connection,
        // fallback value allows querying the program without having a wallet connected
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
    );

    return {connection, provider, program};
}

