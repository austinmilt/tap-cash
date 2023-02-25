import * as anchor from "@project-serum/anchor";
import { TapCash } from "../types/tap-cash";
import { createMint } from "@solana/spl-token";
import { fakeUsdc } from "../constants";

export async function createOrFetchUsdc(program: anchor.Program<TapCash>, auth: anchor.web3.Keypair): Promise<anchor.web3.PublicKey | undefined> {
    let usdc = fakeUsdc;
    let {connection} = program.provider;
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

export function createAccountNoBuffer (acctNumber: number) {
    const buffer = new ArrayBuffer(1); // create a buffer with 1 byte
    const view = new DataView(buffer);
    view.setUint8(0, acctNumber); // write the number to the buffer
    const numAccountsBuffer = new Uint8Array(buffer); // get the byte representation as a Uint8Array
    return numAccountsBuffer;
}