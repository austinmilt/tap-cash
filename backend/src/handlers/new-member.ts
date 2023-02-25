import * as anchor from "@project-serum/anchor";
import { EmailAddress, MemberId, ProfilePicture } from "../../../shared/member";
import { v4 as uuid } from "uuid";
import { DatabaseClient } from "../db/client";
import { BigTableClient } from "../db/bigtable";
import { BANK_SEED, CHECKING_SEED, getWorkspace, MEMBER_SEED, WorkSpace } from "../constants";
import { ApiError, SolanaTxType } from "../../../shared/error";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { createAccountNoBuffer, createOrFetchUsdc } from "../helpers/solana";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const { SystemProgram, SYSVAR_RENT_PUBKEY, PublicKey } = anchor.web3;

//TODO tests

export interface InitializeMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    walletAddress: anchor.web3.PublicKey;
}


export interface InitializeMemberResult {
    memberId: MemberId;
}

//TODO eventually we should periodically sync users' email, name, and picture
const DB_CLIENT: DatabaseClient = BigTableClient.ofDefaults();

export async function initializeMember(request: InitializeMemberArgs): Promise<InitializeMemberResult> {
    // TODO: make sure bank has SOL (local and devnet)

    const workspace: WorkSpace = await getWorkspace();
    const bankAuth = workspace.provider;
    const bankSigner = (bankAuth.wallet as NodeWallet).payer;

    const memberId = request.walletAddress;
    const { connection, program } = workspace;

    const [bankPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(BANK_SEED), bankAuth.publicKey.toBuffer()],
        program.programId
    );

    const [memberPda] = await PublicKey.findProgramAddressSync(
        [Buffer.from(MEMBER_SEED), bankPda.toBuffer(), memberId.toBuffer()],
        program.programId
    );

    // Create Member 
    try {
        let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
        const tx = await program.methods.initializeMember()
            .accountsStrict({
                payer: bankAuth.wallet,
                memberPda: memberPda,
                userId: memberId,
                bank: bankPda,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            })
            .transaction();
        tx.feePayer = bankAuth.wallet.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        await bankAuth.sendAndConfirm(tx);
    }
    catch {
        throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_MEMBER);
    }

    // Create USDC Associated Token Account

    const usdc = await createOrFetchUsdc(program, bankSigner);
    if (!usdc) throw ApiError.solanaTxError(SolanaTxType.CREATE_MINT);

    const numAccountsBuffer = createAccountNoBuffer(1); // Always 1 for Init (1st account)

    const [accountPda] = await PublicKey.findProgramAddressSync(
        [
            memberPda.toBuffer(),
            Buffer.from(CHECKING_SEED),
            usdc.toBuffer(),
            numAccountsBuffer
        ],
        program.programId
    );
    let userAta = await getAssociatedTokenAddress(usdc, accountPda, true);
    try {
        let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
        const tx = await program.methods.initializeAccount()
            .accountsStrict({
                payer: bankAuth.publicKey,
                member: memberPda,
                userId: memberId,
                bank: bankPda,
                accountPda: accountPda,
                accountAta: userAta,
                tokenMint: usdc,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .transaction();
        tx.feePayer = bankAuth.wallet.publicKey;
        tx.recentBlockhash = blockhash;
        tx.lastValidBlockHeight = lastValidBlockHeight;
        await bankAuth.sendAndConfirm(tx);
    }
    catch {
        throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_ACCOUNT);
    }

    // TODO: store mapping from user's email to name, pfp, wallet, and ATA
    DB_CLIENT.addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        memberId,
        userAta
    );

    return {
        memberId: uuid()
    }
}
