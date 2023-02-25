import { PublicKey } from "@solana/web3.js";
import { MemberPublicProfile } from "../../../shared/member";
import { DatabaseClient } from "./client";

export class BigTableClient implements DatabaseClient {
    private constructor() {
        //TODO
    }

    public static ofDefaults(): BigTableClient {
        return new BigTableClient();
    }

    public async addMember(profile: MemberPublicProfile, wallet: PublicKey, usdcAccountAddress: PublicKey): Promise<string> {
        //TODO
        throw new Error("Method not implemented.");
    }

    public async queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]> {
        //TODO
        throw new Error("Method not implemented.");
    }

    public async queryMembersByUsdcAccountAddress(account: PublicKey, limit: number): Promise<MemberPublicProfile[]> {
        //TODO
        throw new Error("Method not implemented.");
    }
}
