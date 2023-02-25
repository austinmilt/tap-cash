import { EmailAddress } from "../../../shared/member";
import { Currency } from "../../../shared/currency";

//TODO tests

export interface DepositArgs {
    emailAddress: EmailAddress;
    currency: Currency;
    amount: number;
    //TODO something about handling credit card info
    //TODO probably the user's private key
}


export interface DepositResult {
    //TODO something about the result of the deposit attempt
}

export async function deposit(request: DepositArgs): Promise<DepositResult> {
    // TODO: delegate the credit card retrieval and processing to Circle client

    // TODO: do we store the info about the transaction in a db so we can show
    // that in the user's Recent Activity? Alternative is to have the frontend
    // query the chain and then have frontend ask the backend to expand stuff
    // by getting user info by their USDC ATA

    return {
        //TODO
    }
}
