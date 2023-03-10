import Config from "react-native-config";
import { PublicKey } from "../solana/solana";
import { OPENLOGIN_NETWORK } from "@web3auth/react-native-sdk";

// use http://10.0.2.2:8080/ when testing/deploying with android emulator locally

export const SAVE_MEMBER_URI: string = parseEnv("SAVE_MEMBER_URI", Config.SAVE_MEMBER_URI);
export const DEPOSIT_URI: string = parseEnv("DEPOSIT_URI", Config.DEPOSIT_URI);
export const SEND_URI: string = parseEnv("SEND_URI", Config.SEND_URI);
export const WITHDRAW_URI: string = parseEnv("WITHDRAW_URI", Config.WITHDRAW_URI);
export const QUERY_RECIPIENTS_URI: string = parseEnv("QUERY_RECIPIENTS_URI", Config.QUERY_RECIPIENTS_URI);
export const MEMBER_ACCOUNT_URI: string = parseEnv("MEMBER_ACCOUNT_URI", Config.MEMBER_ACCOUNT_URI);
export const RECENT_ACTIVITY_URI: string = parseEnv("RECENT_ACTIVITY_URI", Config.RECENT_ACTIVITY_URI);
export const SAVED_PAYMENT_METHODS_URI: string = parseEnv("SAVED_PAYMENT_METHODS_URI", Config.SAVED_PAYMENT_METHODS_URI);
export const WEB3_AUTH_NETWORK: string = parseEnv(
    "WEB3_AUTH_NETWORK",
    Config.WEB3_AUTH_NETWORK,
    undefined,
    v => {
        if (v === "mainnet") return OPENLOGIN_NETWORK.MAINNET;
        else if (v === "testnet") return OPENLOGIN_NETWORK.TESTNET;
        else throw new Error("Invalid network " + v);
    }
)
export const WEB3_AUTH_CLIENT_ID: string = parseEnv(
    "WEB3_AUTH_CLIENT_ID",
    Config.WEB3_AUTH_CLIENT_ID
);
export const SOLANA_RPC_URL: string = parseEnv(
    "SOLANA_RPC_URL",
    Config.SOLANA_RPC_URL
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
    return value as unknown as T;
}

export const MAX_TX_AMOUNT = 9999;
