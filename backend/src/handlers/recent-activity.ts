
//TODO tests

import { MemberActivity } from "../../../shared/activity";
import { EmailAddress } from "../../../shared/member";

export interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}


export async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    return [];
}
