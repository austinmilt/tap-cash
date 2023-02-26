import { web3 } from "@project-serum/anchor";
import { MemberId, MemberPublicProfile } from "@tap/shared/member";

export interface DatabaseClient {
    addMember(
        profile: MemberPublicProfile,
        wallet: web3.PublicKey,
        usdcAccountAddress: web3.PublicKey
    ): Promise<MemberId>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    getMembersByUsdcAccountAddress(accounts: web3.PublicKey[]): Promise<MemberPublicProfile[]>;
}
