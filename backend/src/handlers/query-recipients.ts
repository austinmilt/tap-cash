
//TODO tests

import { MemberPublicProfile } from "@tap/shared/member";

export interface QueryRecipientsArgs {
    emailQuery: string;
    limit: number;
}


export type QueryRecipientsResult = MemberPublicProfile[];


export async function queryRecipients(request: QueryRecipientsArgs): Promise<QueryRecipientsResult> {
    return [];
}
