import * as anchor from "@project-serum/anchor";
import { createMintToCheckedInstruction } from "@solana/spl-token";
import { ApiError } from "@tap/shared/error";
import { FAKE_USDC, RPC_URL, USDC_DECIMALS } from "../constants";
import { BANK_AUTH } from "../program/constants";
import { createWorkspace, WorkSpace } from "../program/workspace";

export class CircleSimulator {
    private readonly connection: anchor.web3.Connection;
    private readonly provider: anchor.AnchorProvider;
    private readonly payer: anchor.web3.Keypair;
    private constructor(sdk: WorkSpace) {
        this.connection = sdk.connection;
        this.provider = sdk.provider;
        this.payer = sdk.payer;
    }

    public static ofDefaults(): CircleSimulator {
        return new CircleSimulator(createWorkspace(RPC_URL, BANK_AUTH));
    }

    public static withSdk(sdk: WorkSpace) {
        return new CircleSimulator(sdk);
    }

    public async simulateDeposit(args: SimulateDepositArgs): Promise<string | undefined> {
        const tokenMint: anchor.web3.PublicKey = FAKE_USDC.publicKey;
        const decimalAmount = args.amount * (10 ** USDC_DECIMALS);
        let ix = await createMintToCheckedInstruction(tokenMint, args.destinationAta, this.provider.publicKey, decimalAmount, USDC_DECIMALS);
        let transaction = new anchor.web3.Transaction().add(ix);

        try {
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await anchor.web3.sendAndConfirmTransaction(this.connection, transaction, [this.payer]);
            return txId;
        }
        catch {
            ApiError.generalServerError("Failed to deposit funds.");
        }

    }
}

interface SimulateDepositArgs {
    destinationAta: anchor.web3.PublicKey,
    amount: number
}