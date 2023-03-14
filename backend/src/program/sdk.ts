import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiError, SolanaQueryType, SolanaTxType } from "../shared/error";
import { RPC_URL, USDC_DECIMALS, USDC_MINT_ADDRESS } from "../constants";
import { BANK_AUTH, BANK_SEED, BANK_USDC_WALLET, CHECKING_SEED, MEMBER_SEED, PROGRAM_ENV } from "./constants";
import { createWorkspace, WorkSpace } from "./workspace";
import { airdropIfNeeded, PublicKey } from "../helpers/solana";
import { TapCash } from "../types/tap-cash";
import { BN } from "bn.js";

/**
 * A client for interacting with the TapCash program.
 */
export interface TapCashClient {
    /**
     *
     *  Initializes a new member with the given userId.
     *  @param userId - Public key of the new user's signer wallet.
     *  @returns PDA address of the new member's USDC associated token account.
     * */
    initializeNewMember(userId: PublicKey): Promise<PublicKey>;

    /**
     *
     *  Sends tokens to a specified recipient.
     *  @param args - SendTokensArgs
     *  @returns The transaction ID of the token transfer
     * */
    sendTokens(args: SendTokensArgs): Promise<string>;

    /**
     *
     * @param member - Public key of the member's USDC account to query.
     * @param maxNumberTx - Maximum number of transactions to return.
     * @returns An array of TransactionDetail objects.
     */
    getRecentActivity(member: PublicKey, maxNumberTx: number): Promise<TransactionDetail[]>;

    /**
     *
     * @param memberPubkey - Public key of Member Web3 Auth Account
     * @returns Public key of Member's USDC Associated Token Account, or undefined if not initialized.
     */
    fetchAtaIfInitialized(memberPubkey: PublicKey): Promise<PublicKey | undefined>;
}

/**
 * Main implementation of the TapCashClient interface, used to create a new instance of the client.
 */
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

    /**
     *      *
     * @returns A new instance of the TapCashClient with default settings (using variables defined in .env).
     */
    public static ofDefaults(): MainTapCashClient {
        return new MainTapCashClient(createWorkspace(RPC_URL, BANK_AUTH));
    }

    /**
     *
     * @param sdk - A WorkSpace object containing the connection, program, and provider.
     * @returns A new instance of the TapCashClient with the given WorkSpace.
     */
    public static withSdk(sdk: WorkSpace) {
        return new MainTapCashClient(sdk);
    }

    /**
     *
     * Fetches the program's bank PDA, and initializes it if it doesn't exist.
     * Seeded by BANK_SEED and the sdk provider wallet.
     * @returns The public key of the program's bank's PDA.
     * @throws solanaTxError if the bank PDA cannot be initialized.
     */
    private async getOrInitBank(): Promise<PublicKey | undefined> {
        const bankAuth = this.provider.wallet;
        const [bankPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
            this.program.programId
        );
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
            await this.provider.sendAndConfirm(tx, undefined, { commitment: "finalized" });
            return bankPda;
        }
        catch {
            ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        }
    }

    /**
     *
     * Fetches the user's PDA address (does not initialize it if it doesn't exist).
     * @param userId Public key of user's web3 auth wallet
     * @returns the member's PDA address
     * @throws an error if the bank PDA cannot located or initialized.
     */
    private async getMemberPda(userId: PublicKey): Promise<PublicKey> {
        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const [memberPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(MEMBER_SEED), bank.toBuffer(), userId.toBuffer()],
            this.program.programId
        );
        return memberPda;
    }

    /**
     *
     * Initializes a new member of a specified bank.
     * @param args - CreateMemberArgs
     * @returns { memberPda: PublicKey, txId: string } - The member's PDA address and the transaction ID of the initialization.
     * @throws solanaTxError if the member cannot be initialized.
     */
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

    /**
     *
     * Fetches the user's account PDA address based on member PDA, mint, and account no (does not initialize it if it doesn't exist).
     * @param args - GetMemberAccountArgs
     * @returns the member's account PDA address
     */
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

    /**
     *
     * Fetches the user's account Associated Token Address where tokens are stored (does not initialize it if it doesn't exist).
     * @param args - GetMemberAccountArgs
     * @returns { accountAta: PublicKey, accountPda: PublicKey } - The member's account ATA address and the member's account PDA address.
     */
    private async getMemberAta(args: GetMemberAccountArgs): Promise<{ accountAta: PublicKey, accountPda: PublicKey }> {
        const accountPda = await this.getMemberAccountPda(args);
        let accountAta = await getAssociatedTokenAddress(args.tokenMint, accountPda, true);
        return { accountAta, accountPda };
    }

    /**
     *
     * Initializes a new account PDA for an existing member.
     * @param args
     * @returns the member's account PDA address as a public key.
     * @throw solanaTxError if the account cannot be initialized.
     */
    private async createAccount(args: CreateAccountArgs): Promise<PublicKey> {
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

    /**
     *
     * New Member Workflow: creates a new member PDA, initializes a new account PDA, and initializes a new account ATA.
     * (assumes that the new account is a USDC account and that the account is the first account for the member)
     * For development environments, airdrops SOL to the sdk provider if needed.
     *
     * @param userId (public key of user's web3 auth wallet)
     * @returns Public key of the member's new USDC associated token account.
     */
    public async initializeNewMember(
        userId: PublicKey
    ): Promise<PublicKey> {
        const systemProgram: PublicKey = anchor.web3.SystemProgram.programId;
        const rent: PublicKey = anchor.web3.SYSVAR_RENT_PUBKEY;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: PublicKey = USDC_MINT_ADDRESS;
        const accountNumber: number = 1;

        if (PROGRAM_ENV !== 'mainnet') {
            await airdropIfNeeded(this.sdk);
            // NOTE: No longer needed w/ circle added
            //await getOrCreateUsdc(this.connection, BANK_AUTH);
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

    /**
     *
     * Transfers tokens from one member's account to another member's account.
     * Assumes:
     *  - that the sender and receiver are both USDC accounts,
     *  - that the sender has enough tokens to send,
     *  - that the sender and receiver are both members of the bank,
     *  - that the sender and receiver are both initialized as the 1st account for their respective members.
     *
     * @param args - SendTokensArgs
     * @returns the transaction signature if successful, undefined if not.
     * @throws solanaTxError if the transaction fails.
     */
    public async sendTokens(args: SendTokensArgs): Promise<string> {
        const decimalAmount = args.amount * (10 ** USDC_DECIMALS);
        const systemProgram: PublicKey = anchor.web3.SystemProgram.programId;
        const tokenProgram = TOKEN_PROGRAM_ID;
        const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
        const tokenMint: PublicKey = USDC_MINT_ADDRESS;
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
                .signers([this.sdk.payer, args.fromMember])
                .transaction();
            tx.feePayer = this.provider.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            return await this.provider.sendAndConfirm(tx, [this.sdk.payer, args.fromMember], { commitment: 'confirmed' });

        } catch (e) {
            throw ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);
        }
    }

    /**
     *
     * Fetches the recent transaction activity for a users's USDC address
     *
     * @param memberUsdcAddress
     * @param maxNumberTx
     * @returns an array of TransactionDetails (parsed results used for classifying transactions)
     * @throws solanaQueryError if the query fails
     */
    public async getRecentActivity(memberUsdcAddress: PublicKey, maxNumberTx = 10): Promise<TransactionDetail[]> {
        try {
            const signatures = await this.connection.getSignaturesForAddress(memberUsdcAddress, { limit: maxNumberTx }, 'confirmed');
            const txDetail = await this.connection.getTransactions(
                signatures.map(sig => sig.signature),
                { commitment: 'confirmed', maxSupportedTransactionVersion: 1 }
            );
            return await this.getParsedMemberTransactions(txDetail, memberUsdcAddress, maxNumberTx);
        }
        catch {
            throw ApiError.solanaQueryError(SolanaQueryType.GET_TX_HISTORY);
        }
    }

    /**
     *
     * Fetches the transaction details for an array of TransactionResponses (signatures) and parses them into TransactionDetails
     * Checks if transaciton involves a current member or the bank
     * Assumes:
     *  - that the member is a member of the bank
     *  - that the mint is USDC
     *
     * @param responses - array of VersionedTransactionResponses
     * @param member - the PublicKey of the member's USDC address
     * @param maxNumberTx - the maximum number of transactions to return
     * @returns - an array of TransactionDetails
     * @throws solanaQueryError if the query fails
     */
    private async getParsedMemberTransactions(responses: (anchor.web3.VersionedTransactionResponse | null)[], member: PublicKey, maxNumberTx = 10): Promise<TransactionDetail[]> {
        const memberString = member.toBase58();
        const programString = this.program.programId.toBase58();
        const fakeUsdcString = USDC_MINT_ADDRESS.toBase58();
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
            let otherPartyAddress: PublicKey | undefined;
            if (otherPartyPreBalance?.owner) {
                otherPartyAddress = getAssociatedTokenAddressSync(USDC_MINT_ADDRESS, new PublicKey(otherPartyPreBalance?.owner), true);
            }
            else if (otherPartyPostBalance?.owner) {
                otherPartyAddress = getAssociatedTokenAddressSync(USDC_MINT_ADDRESS, new PublicKey(otherPartyPostBalance?.owner), true);
            }
            else { otherPartyAddress = undefined }
            const bankPreBalance: TokenBalance | undefined = preTokenBalancesWithAta.find((balance) => balance?.isBank);
            const bankPostBalance: TokenBalance | undefined = postTokenBalancesWithAta.find((balance) => balance?.isBank);
            const bankChange: number = (bankPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (bankPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const otherPartyChange: number = (otherPartyPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (otherPartyPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const memberChange: number = (memberPostBalance?.uiTokenAmount?.uiAmount ?? 0) - (memberPreBalance?.uiTokenAmount?.uiAmount ?? 0);
            const txDetail: TransactionDetail = {
                bankChange,
                otherPartyChange,
                memberChange,
                otherPartyAtaAddress: otherPartyAddress ? otherPartyAddress : undefined,
                memberAtaAddress: member,
                unixTimestamp: tx.blockTime ?? undefined,
            };
            return txDetail;

        }).filter((tx) => tx).filter((tx, i) => i < maxNumberTx) as TransactionDetail[];
        return parsedTxs;
    }

    /**
     * Fetches the member USDC ata for a given user's web3 auth wallet
     * Assumes
     *  - user has only one account
     *  - token mint is USDC
     *
     * @param memberPubkey  Public key of user's web3 auth wallet
     * @returns Public key of member's USDC ata account or undefined if not initialized
     */
    public async fetchAtaIfInitialized(memberPubkey: PublicKey): Promise<PublicKey | undefined> {
        const memberPda = await this.getMemberPda(memberPubkey);
        try {
            const member = await this.sdk.program.account.member.fetchNullable(memberPda);
            if (member?.userId.toBase58() !== memberPubkey.toBase58()) return undefined;
            const memberAccount = await this.getMemberAta({ accountNumber: 1, tokenMint: USDC_MINT_ADDRESS, memberPda })
            // TODO Probably want to add one more check on ata account info
            return memberAccount.accountAta;
        }
        catch {
            return undefined;
        }
    }

}

/**
 * Modified TokenBalance (from web3) including parsed information about the party that owns the balance
 */
interface TokenBalance {
    /** USDC Token address */
    ata: PublicKey;
    /** Is the balance associated with a current member */
    isCurrentMember: boolean;
    /** Is the balance associated with the current active user */
    isUser: boolean;
    /** Is the the provider bank account */
    isBank: boolean;
    /** Which # user's account is this (u8) */
    accountIndex: number;
    /** Token Mint Address as a string (currently USDC only) */
    mint: string;
    /** Owner of the associated token account */
    owner?: string | undefined;
    /** Actual amount of tokens in the account that should be displayed to the user*/
    uiTokenAmount: anchor.web3.TokenAmount;
}

/**
 * Parsed transaction detail for a single transaction
 * including balance changes for the member, other party, and bank
 */
export interface TransactionDetail {
    /* Amount of USDC tokens that changed in the bank account */
    bankChange: number;
    /* Amount of USDC tokens that changed in the other party's account */
    otherPartyChange: number;
    /* Amount of USDC tokens that changed in the member's account */
    memberChange: number;
    /* Public key of the other party's ata account */
    otherPartyAtaAddress: PublicKey | undefined;
    /* Public key of the member's ata account */
    memberAtaAddress: PublicKey;
    /* Unix timestamp of the transaction */
    unixTimestamp?: number;
}

/**
 *  Arguments for creating a member account
 */
interface CreateMemberArgs {
    /* Public key of the user's web3 auth wallet */
    userId: PublicKey
    /* Public key of the member's ata account */
    memberPda: PublicKey;
    /* Public key of the Solana System Program */
    systemProgram: PublicKey;
    /* Public key of the Solana Rent program */
    rent: PublicKey;
    /* Public key of the Program's bank account */
    bank: PublicKey;
}

/**
 * Arguments for getting a member's account
 */
interface GetMemberAccountArgs {
    /* Public key of the member acccount PDA */
    memberPda: PublicKey;
    /* Public key of the mint address for the token (currently restricted to USDC) */
    tokenMint: PublicKey;
    /* Which user account number this is (currently restricted to 1), u8 */
    accountNumber: number;
}

/**
 * Arguments for creating a member's account
 */
interface CreateAccountArgs {
    /* Public key of the member's member PDA */
    member: PublicKey;
    /* Public key of the members Web3 auth wallet */
    userId: PublicKey;
    /* Public key of the Program's bank account */
    bank: PublicKey;
    /* Public key of the member's account (e.g., checking or savings) */
    accountPda: PublicKey;
    /* Public key of the member's ata account */
    accountAta: PublicKey;
    /* Public key of the mint address for the token (currently restricted to USDC) */
    tokenMint: PublicKey;
    /* Public Key of the TOKEN_PROGRAM_ID */
    tokenProgram: PublicKey;
    /* Public Key of the ASSOCIATED_TOKEN_PROGRAM_ID */
    associatedTokenProgram: PublicKey;
    /* Public key of the Solana System Program */
    systemProgram: PublicKey;
}

/**
 * Arguments for sending tokens from a member's account to another member's account
 */
export interface SendTokensArgs {
    /* Key pair of the member's web3 auth wallet for signing transaction */
    fromMember: anchor.web3.Keypair,
    /* Public key of the member's ata account */
    destinationAta: PublicKey,
    /* Fractional token Amount, not decimal tokens (e.g., 1.5 USDC, not 1500000 USDC-lamports) */
    amount: number
}
