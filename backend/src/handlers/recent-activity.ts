
//TODO tests

import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { TapCashClient } from "../program/sdk";
import { MemberActivity } from "../shared/activity";
import { EmailAddress } from "../shared/member";

export interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}


const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

export async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.memberEmail);
    const recentActivity  = await TAP_CLIENT.getRecentActivity(usdcAddress, request.limit);
    //TODO transform member public profile accounts from chain query based on ATA
    //rn just getting the public key

    return recentActivity;
}
