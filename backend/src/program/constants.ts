import { parseKeypair, parsePublicKey } from "../constants";
import { Keypair, PublicKey } from "../helpers/solana";

// Program Seed's Ref: program/tap_cash/programs/tap_cash/src/constants/

/* Seed used for BANK PDA */
export const BANK_SEED = "tap-bank";
/* Seed used for MEMBER PDA */
export const MEMBER_SEED = "member";
/* Seed used for Account PDA (checking) */
export const CHECKING_SEED = "checking";

/* Authority of Program's BANK (will be used to sign transactions and pay fees) */
export const BANK_AUTH: Keypair = parseKeypair("BANK_AUTH", process.env.BANK_KEY);
/* ATA of USDC Wallet of the BANK */
export const BANK_USDC_WALLET: PublicKey = parsePublicKey("BANK_USDC_WALLET", process.env.BANK_USDC_WALLET);
/* Environment of the Program */
export const PROGRAM_ENV = process.env.SOLANA_ENVIRONMENT;
/* Program ID of the Program (ref: program/tap_cash/programs/tap_cash/src/id.rs) */
export const TAPCASH_PROGRAM_ID: PublicKey = new PublicKey("TAPAPp2YoguQQDkicGyzTzkA3t4AgECvR1eL1hbx9qz");
