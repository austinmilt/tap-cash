import * as anchor from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiError, SolanaTxType } from "@tap/shared/error";
import { FAKE_USDC, RPC_URL } from "../constants";
import { BANK_AUTH, BANK_SEED, CHECKING_SEED, MEMBER_SEED } from "./constants";
import { getWorkspace, WorkSpace } from "./workspace";
import { MemberPdaProps, NewMemberProps, MemberAccountPdaProps, NewAccountProps } from "./types";
import { airdropIfNeeded, getOrCreateUsdc } from "../helpers/solana";

export class TapCashClient {
    private readonly sdk: WorkSpace;
    private constructor(sdk: WorkSpace) {
        this.sdk = sdk;
    }

    public static ofDefaults(): TapCashClient {
        return new TapCashClient(getWorkspace({
            endpoint: RPC_URL,
            bankAuth: BANK_AUTH
        }));
    }

    private async getOrInitBank(): Promise<anchor.web3.PublicKey | undefined> {
        const { connection, program, provider } = this.sdk;
        const bankAuth = provider.wallet;
        const [bankPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
            program.programId
        );

        // If Bank is already init, use it (otherwise make it -- e.g., LocalHost session)
        const accountInfo = await connection.getAccountInfo(bankPda);
        if (accountInfo) return bankPda;

        try {
            let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
            const tx = await program.methods.initializeBank()
                .accountsStrict({
                    bankAuthority: bankAuth.publicKey,
                    bank: bankPda,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                })
                .transaction();
            tx.feePayer = provider.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            await provider.sendAndConfirm(tx);

        }
        catch {
            ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        }
    }

    private async getMemberPda(props: MemberPdaProps): Promise<anchor.web3.PublicKey> {
        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const [memberPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(MEMBER_SEED), bank.toBuffer(), props.userId.toBuffer()],
            this.sdk.program.programId
        );
        return memberPda;
    }

    private async createMember(props: NewMemberProps) {
        const { connection, program, provider: bankAuth } = this.sdk;
        try {
            let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
            const tx = await program.methods.initializeMember()
                .accountsStrict({
                    payer: bankAuth.wallet,
                    ...props
                })
                .transaction();
            tx.feePayer = bankAuth.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            const txId = await bankAuth.sendAndConfirm(tx);
            return { memberPda: props.memberPda, txId }
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

    private async getMemberAccountPda(props: MemberAccountPdaProps): Promise<anchor.web3.PublicKey> {
        const [accountPda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                props.memberPda.toBuffer(),
                Buffer.from(CHECKING_SEED),
                props.tokenMint.toBuffer(),
                this.createAccountNoBuffer(props.accountNumber)
            ],
            props.programId
        );
        return accountPda;
    }

    private async getMemberAta(props: MemberAccountPdaProps): Promise<{ accountAta: anchor.web3.PublicKey, accountPda: anchor.web3.PublicKey }> {
        const accountPda = await this.getMemberAccountPda(props);
        let accountAta = await getAssociatedTokenAddress(props.tokenMint, accountPda, true);
        return { accountAta, accountPda };
    }

    private async createAccount(props: NewAccountProps): Promise<anchor.web3.PublicKey | undefined> {
        const { connection, program, provider: bankAuth } = this.sdk;
        try {
            let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
            const tx = await program.methods.initializeAccount()
                .accountsStrict({
                    payer: bankAuth.publicKey,
                    ...props,
                })
                .transaction();
            tx.feePayer = bankAuth.wallet.publicKey;
            tx.recentBlockhash = blockhash;
            tx.lastValidBlockHeight = lastValidBlockHeight;
            await bankAuth.sendAndConfirm(tx);
            return props.accountAta;
        }
        catch {
            throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_ACCOUNT);
        }
    }

    public async initializeNewMember(
        memberProps: MemberPdaProps,
        systemProgram: anchor.web3.PublicKey = anchor.web3.SystemProgram.programId,
        rent: anchor.web3.PublicKey = anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram = TOKEN_PROGRAM_ID,
        associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMint: anchor.web3.PublicKey = FAKE_USDC.publicKey,
        accountNumber: number = 1
    ) {

        // TO DO Add some prod query here @Austin?
        if (!false) { 
            await airdropIfNeeded(this.sdk);
            await getOrCreateUsdc(this.sdk.connection, BANK_AUTH);    
        }

        const bank = await this.getOrInitBank();
        if (!bank) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);
        const memberPda = await this.getMemberPda(memberProps);
        await this.createMember({
            ...memberProps,
            bank,
            memberPda,
            systemProgram,
            rent
        });

        const { accountAta, accountPda } = await this.getMemberAta({
            memberPda,
            tokenMint,
            accountNumber,
            programId: this.sdk.program.programId
        });

        const memberTokenAccount = await this.createAccount({
            ...memberProps,
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





