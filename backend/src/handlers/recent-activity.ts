
//TODO tests

import { MemberActivity } from "../shared/activity";
import { EmailAddress } from "../shared/member";


export interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}


export async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    //TODO query chain for user's activity
    //TODO transform member public profile accounts from chain query based on ATA

    return [];
}
