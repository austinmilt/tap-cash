import { parseKeypair, parsePublicKey } from "../constants";
import { Keypair, PublicKey } from "../helpers/solana";

export const BANK_SEED = "tap-bank";
export const MEMBER_SEED = "member";
export const CHECKING_SEED = "checking";

export const BANK_AUTH: Keypair = parseKeypair("BANK_AUTH", process.env.BANK_KEY);
// TO DO ADD A BANK_USDC_WALLET .env variable
export const BANK_USDC_WALLET: PublicKey = parsePublicKey("BANK_USDC_WALLET", process.env.BANK_USDC_WALLET);
export const PROGRAM_ENV = process.env.SOLANA_ENVIRONMENT;
export const TAPCASH_PROGRAM_ID: PublicKey = new PublicKey("TAPyxAHSs72DNFzhxmWhD9cVJjYqcgH2kHuDsq2NzEz");
