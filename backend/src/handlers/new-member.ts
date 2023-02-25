import * as anchor from "@project-serum/anchor";
import { EmailAddress, MemberId, ProfilePicture } from "../../../shared/member";
import { v4 as uuid } from "uuid";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";

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
    // TODO: call on-chain program to get member account made and UDSC ATA

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
