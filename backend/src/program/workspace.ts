import * as anchor from "@project-serum/anchor";
import { TapCash } from "../types/tap-cash";

export interface WorkSpace {
    connection: anchor.web3.Connection;
    provider: anchor.AnchorProvider;
    program: anchor.Program<TapCash>;
    payer: anchor.web3.Keypair;
}

export function createWorkspace(
    endpoint: string,
    bankAuth: anchor.web3.Keypair
): WorkSpace {
    const program = anchor.workspace.TapCash as anchor.Program<TapCash>;
    const connection = new anchor.web3.Connection(endpoint);
    const anchorWallet = new anchor.Wallet(bankAuth);
    const provider: anchor.AnchorProvider = new anchor.AnchorProvider(
        connection,
        // fallback value allows querying the program without having a wallet connected
        anchorWallet ?? ({} as anchor.Wallet),
        { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
    const payer = bankAuth;
    return { connection, provider, program, payer };
}