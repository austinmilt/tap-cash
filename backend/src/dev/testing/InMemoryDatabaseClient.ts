import { DatabaseClient } from "../../db/client";
import { PublicKey } from "../../helpers/solana";
import { ApiError } from "../../shared/error";
import { EmailAddress, MemberPublicProfile, ProfilePicture } from "../../shared/member";
import { CircleCardId, MemberAccounts } from "../../types/types";
import { v4 as uuid } from "uuid";

interface Member {
    id: string;
    email: EmailAddress;
    name: string;
    profile: ProfilePicture;
    signerAddress: PublicKey;
    usdcAddress: PublicKey;
    circleCreditCards: Set<CircleCardId>;
}

export class InMemoryDatabaseClient implements DatabaseClient {
    private readonly members: Map<string, Member> = new Map();

    private constructor() {

    }

    public static make(): InMemoryDatabaseClient {
        return new InMemoryDatabaseClient();
    }

    public async addMember(profile: MemberPublicProfile, wallet: PublicKey, usdcAddress: PublicKey): Promise<string> {
        if (this.members.has(profile.email)) {
            throw new Error(`Member with email ${profile.email} already exists.`);
        }
        const id: string = uuid();
        this.members.set(profile.email, {
            id: id,
            email: profile.email,
            name: profile.name,
            profile: profile.profile,
            signerAddress: wallet,
            usdcAddress: usdcAddress,
            circleCreditCards: new Set()
        });
        return id;
    }

    public async saveCircleCreditCard(member: EmailAddress, circleCreditCardId: CircleCardId): Promise<void> {
        const memberData: Member = this.getRequiredMember(member);
        memberData.circleCreditCards.add(circleCreditCardId);
    }

    public async queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]> {
        return Array.from(this.members.keys())
            .filter(email => email.startsWith(emailQuery))
            .map(this.members.get)
            .flatMap(member => member ? [member] : [])
            .slice(0, limit)
            .map(memberToPublicProfile);
    }

    public async getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<PublicKey, MemberPublicProfile>> {
        const unique: Set<PublicKey> = new Set(accounts);
        const result: Map<PublicKey, MemberPublicProfile> = new Map();
        for (const member of this.members.values()) {
            if (unique.has(member.usdcAddress)) {
                result.set(member.usdcAddress, memberToPublicProfile(member));
            }
        }
        return result;
    }

    public async getMemberAccountsByEmail(email: string): Promise<MemberAccounts> {
        const member: Member = this.getRequiredMember(email);
        return {
            signerAddress: member.signerAddress,
            usdcAddress: member.usdcAddress
        };
    }

    public async getCircleCreditCards(email: string): Promise<Set<string>> {
        const member: Member = this.getRequiredMember(email);
        return new Set(member.circleCreditCards);
    }

    private getRequiredMember(email: string): Member {
        const member: Member | undefined = this.members.get(email);
        if (member === undefined) {
            throw ApiError.noSuchMember(email);
        }
        return member;
    }
}


function memberToPublicProfile(member: Member): MemberPublicProfile {
    return {
        email: member.email,
        name: member.name,
        profile: member.profile
    };
}
