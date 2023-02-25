import { EmailAddress, MemberId, MemberPublicProfile, ProfilePicture } from "../../../shared/member";
import * as anchor from "@project-serum/anchor";

interface AddMemberArgs {
    profile: MemberPublicProfile;
    wallet: anchor.web3.PublicKey;
    usdcAccountAddress: anchor.web3.PublicKey;
}


export interface DatabaseClient {
    addMember(
        profile: MemberPublicProfile,
        wallet: anchor.web3.PublicKey,
        usdcAccountAddress: anchor.web3.PublicKey
    ): Promise<MemberId>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    queryMembersByUsdcAccountAddress(account: anchor.web3.PublicKey, limit: number): Promise<MemberPublicProfile[]>;
}
