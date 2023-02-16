import {
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
} from "@solana/web3.js";

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


    public static mainnet(ed25519PrivKey: string): SolanaWallet {
        const keypair: Keypair = Keypair.fromSecretKey(Buffer.from(ed25519PrivKey, 'hex'));
        const connection: Connection = new Connection(clusterApiUrl("mainnet-beta"));
        return new SolanaWallet(keypair, connection);
    }


    public getPublicKey(): PublicKey {
        return this.keypair.publicKey;
    }


    public async getBalance(): Promise<number> {
        return await this.connection.getBalance(this.keypair.publicKey);
    }
}
