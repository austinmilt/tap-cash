import { web3 } from "@project-serum/anchor";
import { MemberAccounts } from "../types/types";
import { MemberId, MemberPublicProfile, EmailAddress } from "../shared/member";

export interface DatabaseClient {
    addMember(
        profile: MemberPublicProfile,
        wallet: web3.PublicKey,
        usdcAddress: web3.PublicKey
    ): Promise<MemberId>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    getMembersByUsdcAddress(accounts: web3.PublicKey[]): Promise<MemberPublicProfile[]>;

    getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts>;
    //TODO change signature to return Map<web3.PublicKey, MemberPublicProfile>
    getMembersByUsdcAccountAddress(accounts: web3.PublicKey[]): Promise<MemberPublicProfile[]>;
}
