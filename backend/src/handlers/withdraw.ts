
//TODO tests

import { EmailAddress, AccountId } from "@tap/shared/member";

export interface WithdrawArgs {
    emailAddress: EmailAddress;
    sourceAccount: AccountId;
    amount: number;
    // TODO something about the destination bank account
    //TODO probably the user's private key
}


export interface WithdrawResult {
    //TODO something about the result of the withdraw attempt
}

export async function withdraw(request: WithdrawArgs): Promise<WithdrawResult> {
    return {
        //TODO
    }
}
