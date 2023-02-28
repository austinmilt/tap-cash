import * as anchor from "@project-serum/anchor";
import { ApiError, SolanaTxType } from "../shared/error";
import { EmailAddress, AccountId } from "../shared/member";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { TapCashClient } from "../program/sdk";
import { ApiSendRequest, ApiSendResult } from "../shared/api";
import { getRequiredParam, getPrivateKeyParam, makePostHandler } from "./model";

//TODO tests

interface SendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    senderAccountId: AccountId;
    amount: number;
    privateKey: anchor.web3.Keypair;
}


interface SendResult {
    //TODO something about the result of the send attempt
    solanaTransactionId: string
}


export const handleSend = makePostHandler(send, transformRequest, transformResult);

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

async function send(request: SendArgs): Promise<SendResult> {

    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.recipientEmailAddress);

    // TODO  add decryption in index.ts

    const solanaTransactionId = await TAP_CLIENT.sendTokens({
        fromMember: request.privateKey,
        destinationAta: usdcAddress,
        amount: request.amount
    })

    if (!solanaTransactionId) throw ApiError.solanaTxError(SolanaTxType.TRANSFER_TOKEN);

    return {
        solanaTransactionId
    }
}


function transformRequest(body: ApiSendRequest): SendArgs {
    return {
        senderEmailAddress: getRequiredParam<ApiSendRequest, EmailAddress>(body, "senderEmailAddress"),
        recipientEmailAddress: getRequiredParam<ApiSendRequest, EmailAddress>(body, "recipientEmailAddress"),
        senderAccountId: getRequiredParam<ApiSendRequest, AccountId>(body, "senderAccountId"),
        amount: getRequiredParam<ApiSendRequest, number>(body, "amount", Number.parseFloat),
        privateKey: getPrivateKeyParam<ApiSendRequest>(body, "privateKey")
    };
}


function transformResult(result: SendResult): ApiSendResult {
    // nothing to return
    return {};
}
