import { CircleEnvironments } from "@circle-fin/circle-sdk";
import * as yamlenv from "yamlenv";
import { ServerEnv } from "./types/types";
import { MemberPublicProfile } from "./shared/member";
import * as anchor from "@project-serum/anchor";


// For loading yaml variables locally. In deployed functions (on GCP), the envs are set in the node process
// during deployment
if (process.env.SERVER_ENV === "test") {
    //TODO do this a better way
    process.env.FAKE_USDC = JSON.stringify(Array.from(anchor.web3.Keypair.generate().secretKey));
    process.env.BANK_KEY = JSON.stringify(Array.from(anchor.web3.Keypair.generate().secretKey));
    yamlenv.config({ path: ".env.test.yml" });

} else {
    yamlenv.config({ path: ".env.local.yml" });
}

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
    undefined,
    v => {
        if (v === "local") return ServerEnv.LOCAL;
        if (v === "prod") return ServerEnv.PROD;
        if (v === "dev") return ServerEnv.DEV;
        if (v === "test") return ServerEnv.TEST;
        throw new Error("Unknown environment " + v);
    }
)
export const UNKNOWN_USER_PROFILE: MemberPublicProfile = { name: 'Unknown', email: 'Unknown', profile: 'Unknown' };


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
        try {
            result = transform(value);

        } catch (e) {
            throw new Error(`Unable to transform value for ${name}: ${value}. Error ${(e as unknown as Error).message}`);
        }
    }
    return result;
}

export function parseKeypair(
    name: string,
    value: string | undefined,
    defaultValue?: anchor.web3.Keypair | undefined
): anchor.web3.Keypair {
    return parseEnv(
        name,
        value,
        defaultValue,
        v => anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(v)))
    );
}


export function parsePublicKey(
    name: string,
    value: string | undefined,
    defaultValue?: anchor.web3.PublicKey | undefined
): anchor.web3.PublicKey {
    return parseEnv(
        name,
        value,
        defaultValue,
        v => new anchor.web3.PublicKey(v)
    );
}

function castString<T>(value: string): T {
    return value as unknown as T;
}
