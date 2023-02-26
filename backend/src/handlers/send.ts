import * as anchor from "@project-serum/anchor";
import { ApiError, SolanaTxType } from "@tap/shared/error";
import { EmailAddress, AccountId } from "@tap/shared/member";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { TapCashClient } from "../program/sdk";

//TODO tests

export interface SendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    senderAccountId: AccountId;
    amount: number;
    //TODO probably the sender's private key
}


export interface SendResult {
    //TODO something about the result of the send attempt
    txId: string
}

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

export async function send(request: SendArgs): Promise<SendResult> {

    // TODO await DB_CLIENT.something; 
    const destinationUser = '';
    // TODO Update from DB Query
    const destinationAta: anchor.web3.PublicKey = new anchor.web3.PublicKey('');
    // TODO Update with decryption
    const decryptPrivateKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    const txId = await TAP_CLIENT.sendTokens({
        fromMember: decryptPrivateKey,
        destinationAta,
        amount: request.amount
    })

    if (!txId) throw ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);

    return {
        txId
    }
}
