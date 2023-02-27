import { PublicKey } from "../helpers/solana";
import { EmailAddress, MemberId, MemberPublicProfile } from "../shared/member";
import { CircleCardId, MemberAccounts } from "../types/types";

export interface DatabaseClient {
    addMember(
        profile: MemberPublicProfile,
        wallet: PublicKey,
        usdcAddress: PublicKey
    ): Promise<MemberId>;

    saveCircleCreditCard(member: EmailAddress, circleCreditCardId: string): Promise<void>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<PublicKey, MemberPublicProfile>>;

    getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts>;

    getCircleCreditCards(email: EmailAddress): Promise<Set<CircleCardId>>;
}
