
//TODO tests

import { EmailAddress, AccountId } from "../shared/member";

export interface DepositArgs {
    emailAddress: EmailAddress;
    destinationAccountId: AccountId;
    amount: number;
    //TODO something about handling credit card info
    //TODO probably the user's private key
}


export interface DepositResult {
    //TODO something about the result of the deposit attempt
}

export async function deposit(request: DepositArgs): Promise<DepositResult> {
    // TODO: delegate the credit card retrieval and processing to Circle client

    return {
        //TODO
    }
}
