import * as anchor from "@project-serum/anchor";
import { createMintToCheckedInstruction } from "@solana/spl-token";
import { ApiError } from "../shared/error";
import { FAKE_USDC, RPC_URL, USDC_DECIMALS } from "../constants";
import { BANK_AUTH } from "../program/constants";
import { createWorkspace, WorkSpace } from "../program/workspace";
import { CircleClient, CircleDepositArgs } from "./client";
import { Card, CvvResults } from "@circle-fin/circle-sdk";

export class CircleEmulator implements CircleClient {
    private readonly connection: anchor.web3.Connection;
    private readonly provider: anchor.AnchorProvider;
    private readonly payer: anchor.web3.Keypair;
    private constructor(sdk: WorkSpace) {
        this.connection = sdk.connection;
        this.provider = sdk.provider;
        this.payer = sdk.payer;
    }


    public static ofDefaults(): CircleEmulator {
        return new CircleEmulator(createWorkspace(RPC_URL, BANK_AUTH));
    }

    public static withSdk(sdk: WorkSpace) {
        return new CircleEmulator(sdk);
    }

    public async depositUsdc(args: CircleDepositArgs): Promise<void> {
        const tokenMint: anchor.web3.PublicKey = FAKE_USDC.publicKey;
        const destination: anchor.web3.PublicKey = new anchor.web3.PublicKey(args.destinationAtaString);
        const decimalAmount = args.amount * (10 ** USDC_DECIMALS);
        let ix = createMintToCheckedInstruction(tokenMint, destination, this.provider.publicKey, decimalAmount, USDC_DECIMALS);
        let transaction = new anchor.web3.Transaction().add(ix);

        try {
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await anchor.web3.sendAndConfirmTransaction(this.connection, transaction, [this.payer]);
            return;
        }
        catch {
            ApiError.generalServerError("Failed to deposit funds.");
        }
    }


    public async fetchCard(id: string): Promise<Card> {
        //TODO fill in with something better
        return {
            id: "baronsupercard",
            status: "pending",
            billingDetails: {
                name: "Baron Bilano",
                city: "Baronville",
                country: "Baronia",
                line1: "123 Baron Street",
                postalCode: "12345"
            },
            expMonth: 1,
            expYear: 2025,
            network: "VISA",
            last4: "4321",
            fingerprint: "alskjdflajksdflj",
            verification: {
                avs: "laksjlkasjdf",
                cvv: CvvResults.Pass
            },
            metadata: {
                email: "baron.bilano@gmail.com"
            },
            createDate: "21:30:38Z",
            updateDate: "21:30:38Z"
        }
    }
}
