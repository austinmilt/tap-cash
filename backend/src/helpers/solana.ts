import * as anchor from "@project-serum/anchor";
import { TapCash } from "../types/tap-cash";
import { createMint } from "@solana/spl-token";
import { BANK_AUTH, BANK_SEED, FAKE_USDC, WorkSpace } from "../constants";

/**
 * 
 * Gets USDC Public Key (or creates USDC Mint if one does not exist)
 * 
 * @param connection
 * @param auth 
 * @returns 
 */
export async function getOrCreateUsdc(connection: anchor.web3.Connection, auth: anchor.web3.Keypair): Promise<anchor.web3.PublicKey | undefined> {
    const usdc = FAKE_USDC;

    // If we already have a USDC account, use it (otherwise make it -- e.g., LocalHost session)
    const accountInfo = await connection.getAccountInfo(usdc.publicKey);
    if (accountInfo) return usdc.publicKey;

    try {
        let mintKey = await createMint(
            connection,
            auth,
            auth.publicKey,
            null,
            6,
            usdc
        );
        return mintKey;
    }
    catch {
        return;
    }
}

/**
 * 
 * Gets USDC Public Key (or creates USDC Mint if one does not exist)
 * 
 * @param connection
 * @param auth 
 * @returns 
 */
export async function getOrInitBank(workspace: WorkSpace, auth: anchor.web3.Keypair): Promise<anchor.web3.PublicKey | undefined> {
    const { connection, program, provider } = workspace;
    const bankAuth = provider.wallet;
    const [bankPda] = await anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
        program.programId
    );

    // If Bank is already init, use it (otherwise make it -- e.g., LocalHost session)
    const accountInfo = await connection.getAccountInfo(bankPda);
    if (accountInfo) return bankPda;

    try {
        let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
        const tx = await program.methods.initializeBank()
            .accountsStrict({
                bankAuthority: bankAuth.publicKey,
                bank: bankPda,
                systemProgram: anchor.web3.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY
            })
            .transaction();
        tx.feePayer = provider.wallet.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        await provider.sendAndConfirm(tx);
        
    }
    catch {
        return;
    }
}


/**
 * 
 * Generates a buffer for PDA seed from a u8 number 
 *  
 * @param acctNumber number of the user's account (e.g, 1st account = 1)
 * @returns buffer of a u8 number for PDA
 */
export function createAccountNoBuffer(acctNumber: number) {
    const buffer = new ArrayBuffer(1); // create a buffer with 1 byte
    const view = new DataView(buffer);
    view.setUint8(0, acctNumber); // write the number to the buffer
    const numAccountsBuffer = new Uint8Array(buffer); // get the byte representation as a Uint8Array
    return numAccountsBuffer;
}