import { web3 } from "@project-serum/anchor";
import { EmailAddress, MemberId, MemberPublicProfile } from "@tap/shared/member";
import { MemberAccounts } from "../types/types";

export interface DatabaseClient {
    addMember(
        profile: MemberPublicProfile,
        wallet: web3.PublicKey,
        usdcAddressAddress: web3.PublicKey
    ): Promise<MemberId>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    getMembersByUsdcAddress(accounts: web3.PublicKey[]): Promise<MemberPublicProfile[]>;

    getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts>;
}
