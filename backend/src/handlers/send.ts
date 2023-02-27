import * as anchor from "@project-serum/anchor";
import { ApiError, SolanaTxType } from "../shared/error";
import { EmailAddress, AccountId } from "../shared/member";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { TapCashClient } from "../program/sdk";

//TODO tests

export interface SendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    senderAccountId: AccountId;
    amount: number;
    privateKey: anchor.web3.Keypair;
}


export interface SendResult {
    //TODO something about the result of the send attempt
    txId: string
}

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

export async function send(request: SendArgs): Promise<SendResult> {

    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.recipientEmailAddress);

    // TODO  add decryption in index.ts

    const txId = await TAP_CLIENT.sendTokens({
        fromMember: request.privateKey,
        destinationAta: usdcAddress,
        amount: request.amount
    })

    if (!txId) throw ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);

    return {
        txId
    }
}
