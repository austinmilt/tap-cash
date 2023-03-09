import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiError, SolanaQueryType, SolanaTxType } from "../shared/error";
import { FAKE_USDC, RPC_URL, USDC_DECIMALS } from "../constants";
import { BANK_AUTH, BANK_SEED, BANK_USDC_WALLET, CHECKING_SEED, MEMBER_SEED, PROGRAM_ENV } from "./constants";
import { createWorkspace, WorkSpace } from "./workspace";
import { airdropIfNeeded, getOrCreateUsdc, PublicKey } from "../helpers/solana";
import { TapCash } from "../types/tap-cash";
import { BN } from "bn.js";

export interface TapCashClient {
    initializeNewMember(userId: PublicKey): Promise<PublicKey | undefined>;
    sendTokens(args: SendTokensArgs): Promise<string | undefined>;
    getRecentActivity(member: PublicKey, maxNumberTx: number): Promise<TransactionDetail[]>;
}

export class MainTapCashClient implements TapCashClient {
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

    public static ofDefaults(): MainTapCashClient {
        return new MainTapCashClient(createWorkspace(RPC_URL, BANK_AUTH));
    }

    public static withSdk(sdk: WorkSpace) {
        return new MainTapCashClient(sdk);
    }

    private async getOrInitBank(): Promise<PublicKey | undefined> {
        const bankAuth = this.provider.wallet;
        const [bankPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
            this.program.programId
        );
        // If Bank is already init, use it (otherwise make it -- e.g., LocalHost session)
        try {
            const accountInfo = await this.connection.getAccountInfo(bankPda);
            if (accountInfo) return bankPda;
        }
        catch {
            // do nothing
        }

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
            await this.provider.sendAndConfirm(tx,undefined, {commitment: "finalized"});
            return bankPda;
        }
        catch {
            ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        }
    }

    private async getMemberPda(userId: PublicKey): Promise<PublicKey> {
        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const [memberPda] = PublicKey.findProgramAddressSync(
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
            tx.feePayer = this.provider.publicKey;
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

    private async getMemberAccountPda(args: GetMemberAccountArgs): Promise<PublicKey> {
        const [accountPda] = PublicKey.findProgramAddressSync(
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

    private async getMemberAta(args: GetMemberAccountArgs): Promise<{ accountAta: PublicKey, accountPda: PublicKey }> {
        const accountPda = await this.getMemberAccountPda(args);
        let accountAta = await getAssociatedTokenAddress(args.tokenMint, accountPda, true);
        return { accountAta, accountPda };
    }

    private async createAccount(args: CreateAccountArgs): Promise<PublicKey | undefined> {
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
        userId: PublicKey
    ): Promise<PublicKey | undefined> {
        const systemProgram: PublicKey = anchor.web3.SystemProgram.programId;
        const rent: PublicKey = anchor.web3.SYSVAR_RENT_PUBKEY;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: PublicKey = FAKE_USDC.publicKey;
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

    public async sendTokens(args: SendTokensArgs): Promise<string | undefined> {
        const decimalAmount = args.amount * (10 ** USDC_DECIMALS);
        const systemProgram: PublicKey = anchor.web3.SystemProgram.programId;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: PublicKey = FAKE_USDC.publicKey;
        const accountNumber: number = 1;
        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const memberPda = await this.getMemberPda(args.fromMember.publicKey);
        const { accountPda, accountAta } = await this.getMemberAta({ memberPda, tokenMint, accountNumber });
        try {
            let { lastValidBlockHeight, blockhash } = await this.connection.getLatestBlockhash('finalized');
            const tx = await this.program.methods.sendSpl(new BN(decimalAmount))
                .accountsStrict({
                    payer: this.provider.publicKey,
                    member: memberPda,
                    userId: args.fromMember.publicKey,
                    accountPda,
                    accountAta,
                    destinationAta: args.destinationAta,
                    bank,
                    tokenMint,
                    tokenProgram,
                    associatedTokenProgram,
                    systemProgram
                })
                .signers([this.sdk.payer, args.fromMember ])
                .transaction();
            tx.feePayer = this.provider.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await this.provider.sendAndConfirm(tx, [this.sdk.payer, args.fromMember]);
            return txId
        }
        catch (e) {
            ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);
        }
    }

    public async getRecentActivity(memberUsdcAddress: PublicKey, maxNumberTx = 10): Promise<TransactionDetail[]> {
        try {
            const signatures = await this.connection.getSignaturesForAddress(memberUsdcAddress);
            const txDetail = await this.connection.getTransactions(
                signatures.map(sig => sig.signature),
                { commitment: 'finalized', maxSupportedTransactionVersion: 1 }
            );
            return await this.getParsedMemberTransactions(txDetail, memberUsdcAddress, maxNumberTx);
        }
        catch {
            throw ApiError.solanaQueryError(SolanaQueryType.GET_TX_HISTORY);
        }
    }

    private async getParsedMemberTransactions(responses: (anchor.web3.VersionedTransactionResponse | null)[], member: PublicKey, maxNumberTx = 10): Promise<TransactionDetail[]> {
        const memberString = member.toBase58();
        const programString = this.program.programId.toBase58();
        const fakeUsdcString = FAKE_USDC.publicKey.toBase58();
        const bankUsdcString = BANK_USDC_WALLET.toBase58();
        const parsedTxs = responses.map(tx => {
            // TO DO Update this to account for null preTokenBalances (for CircleEmulator, which uses MintTo Tx)
            // Example: https://explorer.solana.com/tx/5bcK71nuzLFWK6pcZL9eidz7awMMiVh6zufBjNeDuYYbYbrZ7ZcstSM2t5NnEW8zTRRJAyaHq6p7RHaYnzn98CTY
            // OR change our emulator to use Transfer instead of MintTo
            if (!tx || !tx.meta || !tx.meta.preTokenBalances || !tx.meta.postTokenBalances) return;
            // TO DO Create generic method that pre or post token balances could be passed in
            const preTokenBalancesWithAta = tx.meta.preTokenBalances.map((balance: anchor.web3.TokenBalance) => {
                if (!balance.mint || !balance.owner) return;
                if (balance.mint !== fakeUsdcString) return;
                const ata = getAssociatedTokenAddressSync(new PublicKey(balance.mint), new PublicKey(balance.owner), true);

                const isCurrentMember = ata.toBase58() === memberString;
                // TODO Remove isUser (verify on FE)
                const isUser = balance.owner === programString;
                const isBank = balance.owner === bankUsdcString;

                return {
                    ...balance,
                    ata: getAssociatedTokenAddressSync(new PublicKey(balance.mint), new PublicKey(balance.owner), true),
                    isCurrentMember,
                    isUser,
                    isBank
                }
            }).filter((balance) => balance);
            const postTokenBalancesWithAta = tx.meta.postTokenBalances.map((balance) => {
                if (!balance.mint || !balance.owner) return;
                if (balance.mint !== fakeUsdcString) return;
                const ata = getAssociatedTokenAddressSync(new PublicKey(balance.mint), new PublicKey(balance.owner), true);

                const isCurrentMember = ata.toBase58() === memberString;
                // TODO Remove isUser (verify on FE)
                const isUser = balance.owner === programString;
                const isBank = balance.owner === bankUsdcString;
                return {
                    ...balance,
                    ata: getAssociatedTokenAddressSync(new PublicKey(balance.mint), new PublicKey(balance.owner), true),
                    isCurrentMember,
                    isUser,
                    isBank
                }
            }).filter((balance) => balance);

            const memberPreBalance: TokenBalance | undefined = preTokenBalancesWithAta.find((balance) => balance?.isCurrentMember);
            const memberPostBalance: TokenBalance | undefined = postTokenBalancesWithAta.find((balance) => balance?.isCurrentMember);
            const otherPartyPreBalance: TokenBalance | undefined = preTokenBalancesWithAta.find((balance) => !balance?.isCurrentMember);
            const otherPartyPostBalance: TokenBalance | undefined = postTokenBalancesWithAta.find((balance) => !balance?.isCurrentMember);
            const otherPartyAddress: string | undefined = otherPartyPreBalance?.owner ?? otherPartyPostBalance?.owner;
            const bankPreBalance: TokenBalance | undefined = preTokenBalancesWithAta.find((balance) => balance?.isBank);
            const bankPostBalance: TokenBalance | undefined = postTokenBalancesWithAta.find((balance) => balance?.isBank);
            const bankChange: number = (bankPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (bankPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const otherPartyChange: number = (otherPartyPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (otherPartyPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const memberChange: number = (memberPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (memberPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const txDetail: TransactionDetail = {
                bankChange,
                otherPartyChange,
                memberChange,
                otherPartyAtaAddress: otherPartyAddress ? new PublicKey(otherPartyAddress) : undefined,
                memberAtaAddress: member,
                unixTimestamp: tx.blockTime ?? undefined,
            };
            return txDetail;

        }).filter((tx) => tx).filter((tx, i) => i < maxNumberTx) as TransactionDetail[];
        return parsedTxs;
    }
}

interface TokenBalance {
    ata: PublicKey;
    isCurrentMember: boolean;
    isUser: boolean;
    isBank: boolean;
    accountIndex: number;
    mint: string;
    owner?: string | undefined;
    uiTokenAmount: anchor.web3.TokenAmount;
}

export interface TransactionDetail {
    bankChange: number;
    otherPartyChange: number;
    memberChange: number;
    otherPartyAtaAddress: PublicKey | undefined;
    memberAtaAddress: PublicKey;
    unixTimestamp?: number;
}

interface CreateMemberArgs {
    userId: PublicKey
    memberPda: PublicKey;
    systemProgram: PublicKey;
    rent: PublicKey;
    bank: PublicKey;
}

interface GetMemberAccountArgs {
    memberPda: PublicKey;
    tokenMint: PublicKey;
    accountNumber: number;
}

interface CreateAccountArgs {
    member: PublicKey;
    userId: PublicKey;
    bank: PublicKey;
    accountPda: PublicKey;
    accountAta: PublicKey;
    tokenMint: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
    systemProgram: PublicKey;
}

export interface SendTokensArgs {
    fromMember: anchor.web3.Keypair,
    destinationAta: PublicKey,
    /**
     * Fractional token Amount, not decimal tokens (e.g., 1.5 USDC, not 1500000 USDC-lamports)
     */
    amount: number
}
