
//TODO tests

import { MemberPublicProfile } from "../shared/member";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { ApiQueryRecipientsRequest, ApiQueryRecipientsResult } from "../shared/api";
import { getRequiredParam, getRequiredIntegerParam, makeGetHandler } from "./model";

interface QueryRecipientsArgs {
    emailQuery: string;
    limit: number;
}


type QueryRecipientsResult = MemberPublicProfile[];


export const handleQueryRecipients = makeGetHandler(queryRecipients, transformRequest, transformResult);

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();

async function queryRecipients(request: QueryRecipientsArgs): Promise<QueryRecipientsResult> {
    return await DB_CLIENT.queryMembersByEmail(request.emailQuery, request.limit);
}


function transformRequest(params: ApiQueryRecipientsRequest): QueryRecipientsArgs {
    return {
        emailQuery: getRequiredParam<ApiQueryRecipientsRequest, string>(params, "emailQuery"),
        limit: getRequiredIntegerParam<ApiQueryRecipientsRequest>(params, "limit"),
    };
}


function transformResult(result: QueryRecipientsResult): ApiQueryRecipientsResult {
    return result.map(r => ({
        emailAddress: r.email,
        name: r.name,
        profilePicture: r.profile
    }));
}
