import * as anchor from "@project-serum/anchor";
import { EmailAddress, MemberId } from "../../../shared/member";
import { v4 as uuid } from "uuid";

//TODO tests

export interface InitializeMemberArgs {
    emailAddress: EmailAddress;
    walletAddress: anchor.web3.PublicKey;
}


export interface InitializeMemberResult {
    memberId: MemberId;
}

export async function initializeMember(request: InitializeMemberArgs): Promise<InitializeMemberResult> {
    // TODO: call on-chain program to get member account made and UDSC ATA

    // TODO: store mapping from user's email to their wallet address and ATA

    return {
        memberId: uuid()
    }
}
