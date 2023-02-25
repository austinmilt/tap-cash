import * as anchor from "@project-serum/anchor";
import { web3 } from '@project-serum/anchor';
import { EmailAddress, MemberId, ProfilePicture } from "../../../shared/member";
import { v4 as uuid } from "uuid";
import { DatabaseClient } from "../db/client";
import { BigTableClient } from "../db/bigtable";
import { getWorkspace, WorkSpace } from "../constants";
import { ApiError } from "../../../shared/error";

const { SystemProgram, SYSVAR_RENT_PUBKEY, PublicKey } = web3;

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




    // TODO: call on-chain program to get member account made and UDSC ATA
    const workspace: WorkSpace = await getWorkspace();
    const bankAuth = workspace.provider;
    const memberId = request.walletAddress;
    const { connection, program } = workspace;

    const [bankPda, bankBump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("tap-bank"), bankAuth.publicKey.toBuffer()],
        program.programId
    );

    const [memberPda, memberBump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("member"), bankPda.toBuffer(), memberId.toBuffer()],
        program.programId
    );

    // Create Member 
    try {
        let { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash('finalized');
        const tx = await program.methods.initializeMember()
            .accountsStrict({
                payer: bankAuth.publicKey,
                memberPda: memberPda,
                userId: memberId,
                bank: bankPda,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY
            })
            .transaction();
        tx.feePayer = bankAuth.wallet.publicKey;
        tx.recentBlockhash = blockhash;
        let txId = await bankAuth.sendAndConfirm(tx);
    }
    catch {
        throw ApiError.solanaTxError();
    }




    // TODO: store mapping from user's email to name, pfp, wallet, and ATA
    DB_CLIENT.addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        anchor.web3.Keypair.generate().publicKey,
        anchor.web3.Keypair.generate().publicKey
    );

    return {
        memberId: uuid()
    }
}
