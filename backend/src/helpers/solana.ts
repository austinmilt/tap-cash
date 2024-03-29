import * as anchor from "@project-serum/anchor";
import { createMint } from "@solana/spl-token";
import { FAKE_USDC } from "../constants";
import { WorkSpace } from "../program/workspace";

export class PublicKey extends anchor.web3.PublicKey { };
export class Keypair extends anchor.web3.Keypair { };
export class Connection extends anchor.web3.Connection { };


/**
 *
 * Gets USDC Public Key (or creates USDC Mint if one does not exist)
 * (for use in local or devnet environments)
 * 
 * @param connection - Solana Connection
 * @param auth - Keypair of the Mint Authority of USDC
 * @returns USDC Public Key or undefined if USDC Mint could not be created or found
 */
export async function getOrCreateUsdc(connection: Connection, auth: Keypair): Promise<PublicKey | undefined> {
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
 * Airdrops 2 SOL if Balance is below 1 SOL
 *
 * @param workspace - Workspace to use for the emulator
 * @param lamports - Amount of lamports to airdrop (default: 2 SOL)
 * @returns void
 */
export async function airdropIfNeeded(workspace: WorkSpace, lamports = (anchor.web3.LAMPORTS_PER_SOL * 2)): Promise<void> {
    const { connection, program, provider } = workspace;
    try {
        let balance = await connection.getBalance(provider.wallet.publicKey);
        if (balance < 1) throw new Error ("Balance is below 1 SOL");
    }
    catch {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        const airdrop = await connection.requestAirdrop(provider.wallet.publicKey, lamports);
        await connection.confirmTransaction({
            signature: airdrop,
            blockhash: blockhash,
            lastValidBlockHeight: lastValidBlockHeight
        });
    
        return;
    }


}
