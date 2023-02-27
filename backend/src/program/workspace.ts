import * as anchor from "@project-serum/anchor";
import { IDL, TapCash } from "../types/tap-cash";
import { TAPCASH_PROGRAM_ID } from "./constants";

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
    const anchorWallet = new anchor.Wallet(bankAuth);
    const connection = new anchor.web3.Connection(endpoint);
    const provider: anchor.AnchorProvider = new anchor.AnchorProvider(
        connection,
        // fallback value allows querying the program without having a wallet connected
        anchorWallet ?? ({} as anchor.Wallet),
        anchor.AnchorProvider.defaultOptions()
    );
    const program: anchor.Program<TapCash> = new anchor.Program(
        IDL as unknown as TapCash,
        TAPCASH_PROGRAM_ID,
        provider ?? ({} as anchor.AnchorProvider)
    );
    const payer = bankAuth;
    return { connection, provider, program, payer };
}
