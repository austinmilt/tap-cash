import * as anchor from "@project-serum/anchor";
import { IDL, TapCash } from "../types/tap-cash";
import { TAPCASH_PROGRAM_ID } from "./constants";

/**
 * Workspace is a collection of objects that are used to interact with the program.
 */
export interface WorkSpace {
    /* Connection to the Solana network */
    connection: anchor.web3.Connection;
    /* AnchorProvider of the program (Connection, Wallet, options) */
    provider: anchor.AnchorProvider;
    /* Program object of the program */
    program: anchor.Program<TapCash>;
    /* Payer of the program (Keypair) */
    payer: anchor.web3.Keypair;
}

/**
 * 
 * Creates a new workspace for the an instance of the TapCashClient
 * Includes fallbacks if wallet is not connected or provider is not available
 * 
 * @param endpoint - Solana RPC endpoint
 * @param bankAuth - Keypair of the Bank Authority
 * @returns Workspace  
 */
export function createWorkspace(
    endpoint: string,
    bankAuth: anchor.web3.Keypair
): WorkSpace {
    const anchorWallet = new anchor.Wallet(bankAuth);
    const connection = new anchor.web3.Connection(endpoint);
    const provider: anchor.AnchorProvider = new anchor.AnchorProvider(
        connection,
        // fallback value allows querying the program without having a wallet connected
        anchorWallet ?? ({} as anchor.Wallet),
        { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
    const program: anchor.Program<TapCash> = new anchor.Program(
        IDL as unknown as TapCash,
        TAPCASH_PROGRAM_ID,
        provider ?? ({} as anchor.AnchorProvider)
    );
    const payer = bankAuth;
    return { connection, provider, program, payer };
}
