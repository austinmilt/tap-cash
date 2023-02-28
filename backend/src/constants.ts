import { CircleEnvironments } from "@circle-fin/circle-sdk";
import * as yamlenv from "yamlenv";
import * as anchor from "@project-serum/anchor";
import { ServerEnv } from "./types/types";


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


export const FAKE_USDC: anchor.web3.Keypair = parseKeypair("FAKE_USDC", process.env.FAKE_USDC);
export const USDC_DECIMALS: number = 6;
export const RPC_URL: string = parseEnv("RPC_URL", process.env.RPC_URL, anchor.web3.clusterApiUrl('devnet'));
export const SERVER_ENV: ServerEnv = parseEnv(
    "SERVER_ENV",
    process.env.SERVER_ENV,
    ServerEnv.LOCAL,
    v => {
        if (v === "local") return ServerEnv.LOCAL;
        if (v === "prod") return ServerEnv.PROD;
        if (v === "dev") return ServerEnv.DEV;
        throw new Error("Unknown environment " + v);
    }
)


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
    name: string,
    envValue?: string
): anchor.web3.Keypair {
    if (envValue === undefined) {
        throw new Error(`Missing required env variable ${name}.`);
    }
    const u8Array = JSON.parse(envValue);
    const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(u8Array));
    return keypair;
}



function castString<T>(value: string): T {
    return value as unknown as T;
}
