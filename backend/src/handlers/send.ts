import { EmailAddress } from "../../../shared/member";
import { Currency } from "../../../shared/currency";

//TODO tests

export interface sendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    currency: Currency;
    amount: number;
    //TODO probably the sender's private key
}


export interface SendResult {
    //TODO something about the result of the send attempt
}

export async function send(request: sendArgs): Promise<SendResult> {
    // TODO: do we store the info about the transaction in a db so we can show
    // that in the user's Recent Activity? Alternative is to have the frontend
    // query the chain and then have frontend ask the backend to expand stuff
    // by getting user info by their USDC ATA

    return {
        //TODO
    }
}
