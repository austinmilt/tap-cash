import {
    Connection,
    Keypair,
    PublicKey,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export { Connection, PublicKey, Keypair };

/**
 * SolanaWallet is a wrapper around the Solana Keypair and Connection classes.
 */
export class SolanaWallet {
    private readonly keypair: Keypair;
    private readonly connection: Connection;

    /**
     * Constructor for SolanaWallet
     * @param keypair  Keypair of the wallet
     * @param connection Connection to the Solana network
     */
    private constructor(keypair: Keypair, connection: Connection) {
        this.keypair = keypair;
        this.connection = connection;
    }

    
    public static of(ed25519PrivKey: string, solanRpcUrl: string): SolanaWallet {
        const keypair: Keypair = Keypair.fromSecretKey(Buffer.from(ed25519PrivKey, 'hex'));
        const connection: Connection = new Connection(solanRpcUrl);
        return new SolanaWallet(keypair, connection);
    }

    /**
     * 
     * @returns Publickey of the wallet
     */
    public getPublicKey(): PublicKey {
        return this.keypair.publicKey;
    }

    /**
     * 
     * @returns Balance of the wallet in lamports
     */
    public async getSolBalance(): Promise<number> {
        return await this.connection.getBalance(this.keypair.publicKey);
    }

    /**
     * 
     * @param ataAddress ATA address of the USDC account
     * @returns balance of the USDC account in USDC
     */
    public async getUsdcBalance(ataAddress: PublicKey): Promise<number | null> {
        const result: anchor.web3.RpcResponseAndContext<anchor.web3.TokenAmount> = (
            await this.connection.getTokenAccountBalance(ataAddress)
        );
        if (result.value.uiAmount == null) {
            console.warn("User may not have a USDC account.");
        }
        return result.value.uiAmount;
    }

    /**
     * 
     * @returns Keypair of the wallet
     */
    public getKeypair(): Keypair {
        return this.keypair;
    }
}
