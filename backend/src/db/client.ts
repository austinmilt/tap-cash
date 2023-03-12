import { PublicKey } from "../helpers/solana";
import { EmailAddress, MemberId, MemberPrivateProfile, MemberPublicProfile } from "../shared/member";
import { CircleCardId } from "../types/types";

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

    /**
     * 
     * Saves a user's Circle credit card id
     * 
     * @param member User's email address
     * @param circleCreditCardId User's Circle credit card id
     * @throws if the card is not able to be saved
     */
    saveCircleCreditCard(member: EmailAddress, circleCreditCardId: string): Promise<void>;

    /**
     * @param emailQuery email addresses to search for
     * @param limit number of results to return
     * @returns member public profiles where the members' email starts with `emailQuery`
     */
    queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]>;

    /**
     * 
     * @param accounts public keys of user's USDC accounts to search for
     * @returns a map of base58-encoded public key to member profile
     * @throws if any of the accounts are not associated with a member
     */
    getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<string, MemberPublicProfile>>;

    /**
     * 
     * @param email email address of the member
     * @returns the member's private profile
     * @throws if the member does not exist
     */
    getMemberPrivateProfile(email: EmailAddress): Promise<MemberPrivateProfile>;

    /**
     * 
     * @param email email address of the member
     * @returns the set of Circle credit card ids associated with the member
     * @throws if the member does not exist
     */
    getCircleCreditCards(email: EmailAddress): Promise<Set<CircleCardId>>;
}
