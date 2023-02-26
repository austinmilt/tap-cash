import * as anchor from "@project-serum/anchor";
import { parseEnv, parseKeypair } from "../constants";

export const BANK_SEED = "tap-bank";
export const MEMBER_SEED = "member";
export const CHECKING_SEED = "checking";

export const BANK_AUTH: anchor.web3.Keypair = parseEnv<anchor.web3.Keypair>(
    "BANK_AUTH",
    process.env.BANK_KEY,
    undefined,
    (value: string) => parseKeypair(value)
);
