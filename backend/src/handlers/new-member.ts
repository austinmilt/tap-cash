import * as anchor from "@project-serum/anchor";
import { v4 as uuid } from "uuid";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { EmailAddress, ProfilePicture, MemberId } from "@tap/shared/member";
import { ApiError, SolanaTxType } from "@tap/shared/error";
import { TapCashClient } from "../program/sdk";

//TODO tests

export interface InitializeMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


export interface InitializeMemberResult {
    memberId: MemberId;
}

//TODO eventually we should periodically sync users' email, name, and picture
const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

export async function initializeMember(request: InitializeMemberArgs): Promise<InitializeMemberResult> {
    let userAta = await TAP_CLIENT.initializeNewMember(request.signerAddress);

    if (!userAta) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);

    // TODO: store mapping from user's email to name, pfp, wallet, and ATA
    DB_CLIENT.addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        request.signerAddress,
        userAta
    );

    return {
        memberId: uuid()
    }
}
