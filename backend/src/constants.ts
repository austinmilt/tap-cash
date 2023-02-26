import { CircleEnvironments } from "@circle-fin/circle-sdk";
import * as yamlenv from "yamlenv";
import * as anchor from "@project-serum/anchor";


// For loading yaml variables locally. In deployed functions (on GCP), the envs are set in the node process
// during deployment
yamlenv.config({ path: ".env.local.yml" });

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

export const FIRESTORE_MEMBERS_COLLECTION: string = parseEnv(
    "FIRESTORE_MEMBERS_COLLECTION",
    process.env.FIRESTORE_MEMBERS_COLLECTION,
    "tap-members-dev"
);

export function parseEnv<T>(
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

export function parseKeypair(
    envValue: string
): anchor.web3.Keypair {
    const u8Array = envValue.split(",").map(Number);
    const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(u8Array));
    return keypair;
}



function castString<T>(value: string): T {
    return value as unknown as T;
}


export const FAKE_USDC: anchor.web3.Keypair = parseEnv<anchor.web3.Keypair>(
    "FAKE_USDC",
    process.env.FAKE_USDC,
    undefined,
    (value: string) => parseKeypair(value)
);

// TO DO ADD URL LOGIC
export const RPC_URL = anchor.web3.clusterApiUrl('devnet');