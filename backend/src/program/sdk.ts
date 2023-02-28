import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiError, SolanaTxType } from "../shared/error";
import { FAKE_USDC, RPC_URL, USDC_DECIMALS } from "../constants";
import { BANK_AUTH, BANK_SEED, BANK_USDC_WALLET, CHECKING_SEED, MEMBER_SEED, PROGRAM_ENV } from "./constants";
import { createWorkspace, WorkSpace } from "./workspace";
import { airdropIfNeeded, getOrCreateUsdc, PublicKey } from "../helpers/solana";
import { TapCash } from "../types/tap-cash";
import { BN } from "bn.js";
import { MemberActivity, MemberActivityType } from "../shared/activity";
import { Currency } from "../shared/currency";

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

    public async sendTokens(args: SendTokensArgs): Promise<string | undefined> {
        const decimalAmount = args.amount * (10 ** USDC_DECIMALS);
        const systemProgram: anchor.web3.PublicKey = anchor.web3.SystemProgram.programId;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: anchor.web3.PublicKey = FAKE_USDC.publicKey;
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
                .signers([args.fromMember])
                .transaction();
            tx.feePayer = this.provider.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await this.provider.sendAndConfirm(tx);
            return txId
        }
        catch (e) {
            ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);
        }
    }

    public async getRecentActivity(member: anchor.web3.PublicKey, maxNumberTx = 10): Promise<(MemberActivity)[]> {
        try {
            const signatures = await this.connection.getSignaturesForAddress(member);
            const txDetail = await this.connection.getTransactions(
                signatures.map(sig => sig.signature),
                { commitment: 'finalized', maxSupportedTransactionVersion: 1 }
            );
            const parsedTxs = txDetail.map(tx => {
                // TO DO Update this to account for null preTokenBalances (for CircleEmulator, which uses MintTo Tx)
                // Example: https://explorer.solana.com/tx/5bcK71nuzLFWK6pcZL9eidz7awMMiVh6zufBjNeDuYYbYbrZ7ZcstSM2t5NnEW8zTRRJAyaHq6p7RHaYnzn98CTY
                if (!tx || !tx.meta || !tx.meta.preTokenBalances || !tx.meta.postTokenBalances) return;
                {
                    const preTokenBalancesWithAta = tx.meta.preTokenBalances.map((balance) => {
                        if (!balance.mint || !balance.owner) return;
                        if (balance.mint !== FAKE_USDC.publicKey.toBase58()) return;
                        const isCurrentMember = balance.owner === member.toBase58();
                        const isUser = balance.owner === this.program.programId.toBase58();
                        const isBank = balance.owner === BANK_USDC_WALLET.toBase58();
                        return {
                            ...balance,
                            ata: getAssociatedTokenAddress(new PublicKey(balance.mint), new PublicKey(balance.owner), true),
                            isCurrentMember,
                            isUser,
                            isBank
                        }
                    }).filter((balance) => balance);
                    const postTokenBalancesWithAta = tx.meta.postTokenBalances.map((balance) => {
                        if (!balance.mint || !balance.owner) return;
                        if (balance.mint !== FAKE_USDC.publicKey.toBase58()) return;
                        const isCurrentMember = balance.owner === member.toBase58();
                        const isUser = balance.owner === this.program.programId.toBase58();
                        const isBank = balance.owner === BANK_USDC_WALLET.toBase58();
                        return {
                            ...balance,
                            ata: getAssociatedTokenAddress(new PublicKey(balance.mint), new PublicKey(balance.owner), true),
                            isCurrentMember,
                            isUser,
                            isBank
                        }
                    }).filter((balance) => balance);
    
                    const memberPreBalance = preTokenBalancesWithAta.find((balance) => balance?.isCurrentMember);
                    const memberPostBalance = postTokenBalancesWithAta.find((balance) => balance?.isCurrentMember);
                    const otherPartyPreBalance = preTokenBalancesWithAta.find((balance) => balance?.isUser && !balance?.isCurrentMember);
                    const otherPartyPostBalance = postTokenBalancesWithAta.find((balance) => balance?.isUser && !balance?.isCurrentMember);
                    const otherPartyAddress = otherPartyPreBalance?.owner ?? otherPartyPostBalance?.owner;
                    const bankPreBalance = preTokenBalancesWithAta.find((balance) => balance?.isBank);
                    const bankPostBalance = postTokenBalancesWithAta.find((balance) => balance?.isBank);
                    const bankChange = (bankPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (bankPreBalance?.uiTokenAmount?.uiAmount ?? 0);
                    const otherPartyChange = (otherPartyPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (otherPartyPreBalance?.uiTokenAmount?.uiAmount ?? 0);
                    const memberChange = (memberPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (memberPreBalance?.uiTokenAmount?.uiAmount ?? 0);
                    const txType: MemberActivityType
                        = bankChange < 0 ? MemberActivityType.DEPOSIT
                            : bankChange > 0 ? MemberActivityType.WITHDRAW
                                : (otherPartyChange < 0 && memberChange > 0) ? MemberActivityType.RECEIVE
                                    : (otherPartyChange > 0 && memberChange < 0) ? MemberActivityType.SEND
                                        : MemberActivityType.UNKNOWN;
    
                    let memberActivity: MemberActivity;
                    switch (txType) {
                        case MemberActivityType.DEPOSIT:
                            memberActivity = {
                                type: MemberActivityType.DEPOSIT,
                                deposit: {
                                    amount: bankChange,
                                    account: member.toBase58(),
                                    currency: Currency.USD
                                },
                                timestamp: tx.blockTime ?? undefined
                            }
                            break;
                        case MemberActivityType.WITHDRAW:
                            memberActivity = {
                                type: MemberActivityType.WITHDRAW,  
                                withdraw: {
                                    amount: bankChange,
                                    source: member.toBase58(),
                                    currency: Currency.USD
                                },
                                timestamp: tx.blockTime ?? undefined
                            }   
                            break;
                        case MemberActivityType.RECEIVE:
                            memberActivity = {
                                type: MemberActivityType.RECEIVE,
                                receive: {
                                    amount: memberChange,
                                    sender: new PublicKey(otherPartyAddress ?? ''),
                                    currency: Currency.USD
                                },
                                timestamp: tx.blockTime ?? undefined
                            }
                            break;
                        case MemberActivityType.SEND:
                            memberActivity = {
                                type: MemberActivityType.SEND,
                                send: {
                                    amount: memberChange,
                                    recipient: new PublicKey(otherPartyAddress ?? ''),
                                    currency: Currency.USD
                                },
                                timestamp: tx.blockTime ?? undefined
                            }
                            break;
                        default:
                            memberActivity = { 
                                type: MemberActivityType.UNKNOWN,
                                timestamp: tx.blockTime ?? undefined
                            } 
                            break;
                    }
                    return memberActivity;
                }
            }).filter((tx) => tx).filter((tx, i) => i < maxNumberTx) as MemberActivity[];
            return parsedTxs;
        }
        catch {
            throw ApiError.solanaTxError(SolanaTxType.GET_TX_HISTORY);
        }
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

interface SendTokensArgs {
    fromMember: anchor.web3.Keypair,
    destinationAta: anchor.web3.PublicKey,
    /**
     * Fractional token Amount, not decimal tokens (e.g., 1.5 USDC, not 1500000 USDC-lamports)
     */
    amount: number
}