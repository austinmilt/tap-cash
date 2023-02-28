import Config from "react-native-config";

//TODO

// use http://10.0.2.2:8080/ when testing/deploying with android emulator locally

export const NEW_MEMBER_URI: string = parseEnv("NEW_MEMBER_URI", Config.NEW_MEMBER_URI);
export const DEPOSIT_URI: string = parseEnv("DEPOSIT_URI", Config.DEPOSIT_URI);
export const SEND_URI: string = parseEnv("SEND_URI", Config.SEND_URI);
export const WITHDRAW_URI: string = parseEnv("WITHDRAW_URI", Config.WITHDRAW_URI);
export const QUERY_RECIPIENTS_URI: string = parseEnv("QUERY_RECIPIENTS_URI", Config.QUERY_RECIPIENTS_URI);
export const RECENT_ACTIVITY_URI: string = parseEnv("RECENT_ACTIVITY_URI", Config.RECENT_ACTIVITY_URI);
export const SAVED_PAYMENT_METHODS_URI: string = parseEnv("SAVED_PAYMENT_METHODS_URI", Config.SAVED_PAYMENT_METHODS_URI);


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

function parseKeypair(
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
