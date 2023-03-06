import { DatabaseClient } from "../../db/client";
import { PublicKey } from "../../helpers/solana";
import { ApiError } from "../../shared/error";
import { EmailAddress, MemberId, MemberPublicProfile, ProfilePicture } from "../../shared/member";
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

    public async updateMember(profile: Partial<MemberPublicProfile>): Promise<MemberId> {
        if (profile.email == null) {
            throw ApiError.invalidParameter("email");
        }
        const member = this.getRequiredMember(profile.email);
        this.members.set(profile.email, { ...member, ...profile });
        return member.id;
    }

    public async isMember(email: EmailAddress): Promise<boolean> {
        return this.getMember(email) !== undefined;
    }

    public async saveCircleCreditCard(member: EmailAddress, circleCreditCardId: CircleCardId): Promise<void> {
        const memberData: Member = this.getRequiredMember(member);
        memberData.circleCreditCards.add(circleCreditCardId);
    }

    public async queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]> {
        const results: MemberPublicProfile[] = [];
        for (const value of this.members.values()) {
            if (results.length >= limit) {
                break;
            }

            if (value.email.startsWith(emailQuery)) {
                results.push(value);
            }
        }
        return results;
    }

    public async getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<string, MemberPublicProfile>> {
        const unique: Set<string> = new Set(accounts.map(p => p.toBase58()));
        const result: Map<string, MemberPublicProfile> = new Map();
        for (const member of this.members.values()) {
            if (unique.has(member.usdcAddress.toBase58())) {
                result.set(member.usdcAddress.toBase58(), memberToPublicProfile(member));
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
        const member: Member | undefined = this.getMember(email);
        if (member === undefined) {
            throw ApiError.noSuchMember(email);
        }
        return member;
    }

    private getMember(email: EmailAddress): Member | undefined {
        return this.members.get(email);
    }
}


function memberToPublicProfile(member: Member): MemberPublicProfile {
    return {
        email: member.email,
        name: member.name,
        profile: member.profile
    };
}
