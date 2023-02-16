import {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { USDC_MINT_ADDRESS } from "../common/constants";

export class SolanaWallet {
    private readonly keypair: Keypair;
    private readonly connection: Connection;

    private constructor(keypair: Keypair, connection: Connection) {
        this.keypair = keypair;
        this.connection = connection;
    }


    public static devnet(ed25519PrivKey: string): SolanaWallet {
        const keypair: Keypair = Keypair.fromSecretKey(Buffer.from(ed25519PrivKey, 'hex'));
        const connection: Connection = new Connection(clusterApiUrl("devnet"));
        return new SolanaWallet(keypair, connection);
    }


    public static testnet(ed25519PrivKey: string): SolanaWallet {
        const keypair: Keypair = Keypair.fromSecretKey(Buffer.from(ed25519PrivKey, 'hex'));
        const connection: Connection = new Connection(clusterApiUrl("testnet"));
        return new SolanaWallet(keypair, connection);
    }


    public static mainnet(ed25519PrivKey: string): SolanaWallet {
        const keypair: Keypair = Keypair.fromSecretKey(Buffer.from(ed25519PrivKey, 'hex'));
        const connection: Connection = new Connection(clusterApiUrl("mainnet-beta"));
        return new SolanaWallet(keypair, connection);
    }


    public getPublicKey(): PublicKey {
        return this.keypair.publicKey;
    }


    public async getSolBalance(): Promise<number> {
        return await this.connection.getBalance(this.keypair.publicKey);
    }


    public async getUsdcBalance(): Promise<number | null> {
        const usdcTokenAccount: PublicKey = await anchor.utils.token.associatedAddress({
            mint: USDC_MINT_ADDRESS,
            owner: this.keypair.publicKey
        });
        const result: anchor.web3.RpcResponseAndContext<anchor.web3.TokenAmount> = await this.connection.getTokenAccountBalance(usdcTokenAccount);
        if (result.value.uiAmount == null) {
            console.warn("User may not have a USDC account.");
        }
        return result.value.uiAmount;
    }
}
