import * as anchor from "@project-serum/anchor";
import { v4 as uuid } from "uuid";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { EmailAddress, ProfilePicture, MemberId } from "@tap/shared/member";
import { BANK_AUTH, BANK_SEED, CHECKING_SEED, MEMBER_SEED } from "../program/constants";
import { getMemberPda, getOrInitBank } from "../program/sdk-non";
import { getWorkspace, WorkSpace } from "../program/workspace";
import { airdropIfNeeded, getOrCreateUsdc } from "../helpers/solana";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApiError, ApiErrorCode, SolanaTxType } from "@tap/shared/error";
import { TapCashClient } from "../program/sdk";
import { RPC_URL } from "../constants";

const { SystemProgram, SYSVAR_RENT_PUBKEY } = anchor.web3;

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
const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();

export async function initializeMember(request: InitializeMemberArgs): Promise<InitializeMemberResult> {
    const workspace: WorkSpace = await getWorkspace({
        endpoint: RPC_URL,
        bankAuth: BANK_AUTH
    });
    const { connection, program: {programId} } = workspace;

    const bankSigner: anchor.web3.Keypair = BANK_AUTH;


    // TO DO Move this to some type of devnet script
    // Make sure payer wallet has SOL
    await airdropIfNeeded(workspace);

    // TO DO Move this to some type of devnet script
    // Create USDC Associated Token Account
    const usdc = await getOrCreateUsdc(connection, bankSigner);
    if (!usdc) throw ApiError.solanaTxError(SolanaTxType.CREATE_MINT);

    const client = new TapCashClient(workspace);

   let userAta = await client.initializeNewMember({
    userId: request.walletAddress,
    programId
   })
   if (!userAta) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);

    // TODO: store mapping from user's email to name, pfp, wallet, and ATA
    DB_CLIENT.addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        request.walletAddress,
        userAta
    );

    return {
        memberId: uuid()
    }
}
