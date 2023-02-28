
//TODO tests

import { MemberActivity } from "../shared/activity";
import { ApiRecentActivityRequest, ApiRecentActivityResult } from "../shared/api";
import { EmailAddress } from "../shared/member";
import { getRequiredParam, getRequiredIntegerParam, makeGetHandler } from "./model";

interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}


export const handleRecentActivity = makeGetHandler(getRecentActivity, transformRequest, transformResult);


async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    //TODO query chain for user's activity
    //TODO transform member public profile accounts from chain query based on ATA

    return [];
}


function transformRequest(params: ApiRecentActivityRequest): RecentActivityArgs {
    return {
        memberEmail: getRequiredParam<ApiRecentActivityRequest, EmailAddress>(params, "memberEmail"),
        limit: getRequiredIntegerParam<ApiRecentActivityRequest>(params, "limit"),
    };
}


function transformResult(result: MemberActivity[]): ApiRecentActivityResult {
    return result;
}
