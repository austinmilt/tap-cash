import { PublicKey } from "../helpers/solana";
import { EmailAddress, MemberId, MemberPublicProfile } from "../shared/member";
import { CircleCardId, MemberAccounts } from "../types/types";

export interface DatabaseClient {

    /**
     * Adds a new member the db.
     *
     * @param profile user profile info
     * @param signerAddress public address of the signer wallet belonging to the member
     * @param usdcAddress public address of the member's USDC account
     * @throws if a member with the same email already exists
     */
    addMember(
        profile: MemberPublicProfile,
        signerAddress: PublicKey,
        usdcAddress: PublicKey
    ): Promise<MemberId>;


    /**
     * Updates the member's profile info if they exist.
     *
     * @param profile profile data to update
     * @throws if the member has not been added to the db
     */
    updateMember(profile: Partial<MemberPublicProfile>): Promise<MemberId>;

    /**
     * @param emailAddress email address to check for membership
     * @returns `true` if the email address is associated with a member, `false` otherwise
     */
    isMember(emailAddress: EmailAddress): Promise<boolean>;

    saveCircleCreditCard(member: EmailAddress, circleCreditCardId: string): Promise<void>;

    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<string, MemberPublicProfile>>;

    getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts>;

    getCircleCreditCards(email: EmailAddress): Promise<Set<CircleCardId>>;
}
