
//TODO tests

import { EmailAddress, AccountId } from "@tap/shared/member";

export interface SendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    senderAccountId: AccountId;
    amount: number;
    //TODO probably the sender's private key
}


export interface SendResult {
    //TODO something about the result of the send attempt
}

export async function send(request: SendArgs): Promise<SendResult> {
    return {
        //TODO
    }
}
