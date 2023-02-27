import * as anchor from "@project-serum/anchor";
import { parseKeypair } from "../constants";

export const BANK_SEED = "tap-bank";
export const MEMBER_SEED = "member";
export const CHECKING_SEED = "checking";

export const BANK_AUTH: anchor.web3.Keypair = parseKeypair("BANK_AUTH", process.env.BANK_KEY);
export const PROGRAM_ENV = process.env.SOLANA_ENVIRONMENT;
export const TAPCASH_PROGRAM_ID: anchor.web3.PublicKey = new anchor.web3.PublicKey("TAPyxAHSs72DNFzhxmWhD9cVJjYqcgH2kHuDsq2NzEz");
