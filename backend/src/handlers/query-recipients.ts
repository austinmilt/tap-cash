
//TODO tests

import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";

export interface QueryRecipientsArgs {
    emailQuery: string;
    limit: number;
}


export type QueryRecipientsResult = MemberPublicProfile[];


const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();


export async function queryRecipients(request: QueryRecipientsArgs): Promise<QueryRecipientsResult> {
    return await DB_CLIENT.queryMembersByEmail(request.emailQuery, request.limit);
}
