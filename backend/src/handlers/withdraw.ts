import { AccountId, EmailAddress } from "../../../shared/member";

//TODO tests

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
    // TODO: do we store the info about the transaction in a db so we can show
    // that in the user's Recent Activity? Alternative is to have the frontend
    // query the chain and then have frontend ask the backend to expand stuff
    // by getting user info by their USDC ATA

    return {
        //TODO
    }
}
