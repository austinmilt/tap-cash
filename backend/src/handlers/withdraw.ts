
//TODO tests

import { ApiWithdrawRequest, ApiWithdrawResult } from "../shared/api";
import { EmailAddress, AccountId } from "../shared/member";
import { getRequiredParam, makePostHandler } from "./model";

interface WithdrawArgs {
    emailAddress: EmailAddress;
    sourceAccount: AccountId;
    amount: number;
    // TODO something about the destination bank account
    //TODO probably the user's private key
}


interface WithdrawResult {
    //TODO something about the result of the withdraw attempt
}


export const handleWithdraw = makePostHandler(withdraw, transformRequest, transformResult);


async function withdraw(request: WithdrawArgs): Promise<WithdrawResult> {
    return {
        //TODO
    }
}


function transformRequest(body: ApiWithdrawRequest): WithdrawArgs {
    return {
        emailAddress: getRequiredParam<ApiWithdrawRequest, EmailAddress>(body, "emailAddress"),
        sourceAccount: getRequiredParam<ApiWithdrawRequest, AccountId>(body, "sourceAccount"),
        amount: getRequiredParam<ApiWithdrawRequest, number>(body, "amount", Number.parseFloat)
    };
}


function transformResult(result: WithdrawResult): ApiWithdrawResult {
    // nothing to return
    return {};
}
