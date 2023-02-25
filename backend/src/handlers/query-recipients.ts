
//TODO tests

import { EmailAddress, ProfilePicture } from "../../../shared/member";

export interface QueryRecipientsArgs {
    emailQuery: string;
    limit: number;
}


export type QueryRecipientsResult = {
    emailAddress: EmailAddress;
    profilePicture: ProfilePicture;
    name: string;
}[];


export async function queryRecipients(request: QueryRecipientsArgs): Promise<QueryRecipientsResult> {
    return [];
}
