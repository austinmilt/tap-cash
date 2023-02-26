import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { FAKE_USDC, RPC_URL } from "../constants";
import { BANK_AUTH, BANK_SEED, CHECKING_SEED, MEMBER_SEED, PROGRAM_ENV } from "./constants";
import { createWorkspace, WorkSpace } from "./workspace";
import { airdropIfNeeded, getOrCreateUsdc } from "../helpers/solana";
import { TapCash } from "../types/tap-cash";
import { ApiError, SolanaTxType } from "../shared/error";

export class TapCashClient {
    private readonly sdk: WorkSpace;
    private readonly connection: anchor.web3.Connection;
    private readonly program: anchor.Program<TapCash>;
    private readonly provider: anchor.AnchorProvider;
    private constructor(sdk: WorkSpace) {
        this.sdk = sdk;
        this.connection = sdk.connection;
        this.program = sdk.program;
        this.provider = sdk.provider;
    }

    public static ofDefaults(): TapCashClient {
        return new TapCashClient(createWorkspace(RPC_URL, BANK_AUTH));
    }

    public static withSdk(sdk: WorkSpace) {
        return new TapCashClient(sdk);
    }

    private async getOrInitBank(): Promise<anchor.web3.PublicKey | undefined> {
        const bankAuth = this.provider.wallet;
        const [bankPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
            this.program.programId
        );

        // If Bank is already init, use it (otherwise make it -- e.g., LocalHost session)
        const accountInfo = await this.connection.getAccountInfo(bankPda);
        if (accountInfo) return bankPda;

        try {
            let { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
            const tx = await this.program.methods.initializeBank()
                .accountsStrict({
                    bankAuthority: bankAuth.publicKey,
                    bank: bankPda,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .transaction();
            tx.feePayer = this.provider.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            await this.provider.sendAndConfirm(tx);

        }
        catch {
            ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        }
    }

    private async getMemberPda(userId: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> {
        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const [memberPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(MEMBER_SEED), bank.toBuffer(), userId.toBuffer()],
            this.program.programId
        );
        return memberPda;
    }

    private async createMember(args: CreateMemberArgs) {
        try {
            let { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
            const tx = await this.program.methods.initializeMember()
                .accountsStrict({
                    payer: this.provider.publicKey,
                    ...args
                })
                .transaction();
            tx.feePayer = this.provider.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await this.provider.sendAndConfirm(tx);
            return { memberPda: args.memberPda, txId }
        }
        catch {
            throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_MEMBER);
        }
    }

    /**
     *
     * Generates a buffer for PDA seed from a u8 number
     *
     * @param acctNumber number of the user's account (e.g, 1st account = 1)
     * @returns buffer of a u8 number for PDA
     */
    private createAccountNoBuffer(acctNumber: number) {
        if (acctNumber > 255) { ApiError.invalidParameter('Account Number') }
        const buffer = new ArrayBuffer(1); // create a buffer with 1 byte
        const view = new DataView(buffer);
        view.setUint8(0, acctNumber); // write the number to the buffer
        const numAccountsBuffer = new Uint8Array(buffer); // get the byte representation as a Uint8Array
        return numAccountsBuffer;
    }

    private async getMemberAccountPda(args: GetMemberAccountArgs): Promise<anchor.web3.PublicKey> {
        const [accountPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                args.memberPda.toBuffer(),
                Buffer.from(CHECKING_SEED),
                args.tokenMint.toBuffer(),
                this.createAccountNoBuffer(args.accountNumber)
            ],
            this.program.programId
        );
        return accountPda;
    }

    private async getMemberAta(args: GetMemberAccountArgs): Promise<{ accountAta: anchor.web3.PublicKey, accountPda: anchor.web3.PublicKey }> {
        const accountPda = await this.getMemberAccountPda(args);
        let accountAta = await getAssociatedTokenAddress(args.tokenMint, accountPda, true);
        return { accountAta, accountPda };
    }

    private async createAccount(args: CreateAccountArgs): Promise<anchor.web3.PublicKey | undefined> {
        try {
            let { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
            const tx = await this.program.methods.initializeAccount()
                .accountsStrict({
                    payer: this.provider.publicKey,
                    ...args,
                })
                .transaction();
            tx.feePayer = this.provider.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            await this.provider.sendAndConfirm(tx);
            return args.accountAta;
        }
        catch {
            throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_ACCOUNT);
        }
    }

    public async initializeNewMember(
        userId: anchor.web3.PublicKey
    ) {
        const systemProgram: anchor.web3.PublicKey = anchor.web3.SystemProgram.programId;
        const rent: anchor.web3.PublicKey = anchor.web3.SYSVAR_RENT_PUBKEY;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: anchor.web3.PublicKey = FAKE_USDC.publicKey;
        const accountNumber: number = 1;

        if (PROGRAM_ENV !== 'mainnet') {
            await airdropIfNeeded(this.sdk);
            await getOrCreateUsdc(this.connection, BANK_AUTH);
        }

        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const memberPda = await this.getMemberPda(userId);
        await this.createMember({
            userId,
            bank,
            memberPda,
            systemProgram,
            rent
        });

        const { accountAta, accountPda } = await this.getMemberAta({
            memberPda,
            tokenMint,
            accountNumber,
        });

        const memberTokenAccount = await this.createAccount({
            userId,
            member: memberPda,
            bank,
            accountPda,
            accountAta,
            tokenMint,
            tokenProgram,
            associatedTokenProgram,
            systemProgram
        })

        return memberTokenAccount;

    }
}

interface CreateMemberArgs {
    userId: anchor.web3.PublicKey
    memberPda: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
    rent: anchor.web3.PublicKey;
    bank: anchor.web3.PublicKey;
}

interface GetMemberAccountArgs {
    memberPda: anchor.web3.PublicKey;
    tokenMint: anchor.web3.PublicKey;
    accountNumber: number;
}

interface CreateAccountArgs {
    member: anchor.web3.PublicKey;
    userId: anchor.web3.PublicKey;
    bank: anchor.web3.PublicKey;
    accountPda: anchor.web3.PublicKey;
    accountAta: anchor.web3.PublicKey;
    tokenMint: anchor.web3.PublicKey;
    tokenProgram: anchor.web3.PublicKey;
    associatedTokenProgram: anchor.web3.PublicKey;
    systemProgram: anchor.web3.PublicKey;
}
