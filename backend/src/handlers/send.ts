import * as anchor from "@project-serum/anchor";
import { ApiError, SolanaTxType } from "../shared/error";
import { EmailAddress } from "../shared/member";
import { ApiSendRequest, ApiSendResult } from "../shared/api";
import { getRequiredParam, getPrivateKeyParam, makePostHandler } from "./model";
import { getDatabaseClient, getTapCashClient } from "../helpers/singletons";

//TODO tests

interface SendArgs {
    senderEmailAddress: EmailAddress;
    recipientEmailAddress: EmailAddress;
    amount: number;
    privateKey: anchor.web3.Keypair;
}


interface SendResult {
    //TODO something about the result of the send attempt
    solanaTransactionId: string
}


export const handleSend = makePostHandler(send, transformRequest, transformResult);

async function send(request: SendArgs): Promise<SendResult> {

    const { usdcAddress } = await getDatabaseClient().getMemberAccountsByEmail(request.recipientEmailAddress);

    // TODO  add decryption in index.ts

    const solanaTransactionId = await getTapCashClient().sendTokens({
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
        amount: getRequiredParam<ApiSendRequest, number>(body, "amount", Number.parseFloat),
        privateKey: getPrivateKeyParam<ApiSendRequest>(body, "privateKey")
    };
}


function transformResult(result: SendResult): ApiSendResult {
    // nothing to return
    return {};
}
