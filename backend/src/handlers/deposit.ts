import { ApiDepositRequest, ApiDepositResult, ApiResponseStatus } from "../shared/api";
import { EmailAddress, AccountId } from "../shared/member";
import { getRequiredParam, makePostHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";

//TODO tests


export interface DepositArgs {
    emailAddress: EmailAddress;
    destinationAccountId: AccountId;
    amount: number;
    //TODO something about handling credit card info
    //TODO probably the user's private key
}


export interface DepositResult {
}

export const handleDeposit = makePostHandler(deposit, transformRequest, transformResult);


async function deposit(request: DepositArgs): Promise<DepositResult> {
    // TODO: delegate the credit card retrieval and processing to Circle client

    const { usdcAddress } = await getDatabaseClient().getMemberAccountsByEmail(request.emailAddress);

    try {
        await getCircleClient().transferUsdc({ destinationAtaString: usdcAddress.toString(), amount: request.amount });
        return {
            result: ApiResponseStatus.SUCCESS,
            amount: request.amount
        }
    } catch {
        return {
            result: ApiResponseStatus.SERVER_ERROR,
        }
    }
}


function transformRequest(body: ApiDepositRequest): DepositArgs {
    return {
        emailAddress: getRequiredParam<ApiDepositRequest, EmailAddress>(body, "emailAddress"),
        destinationAccountId: getRequiredParam<ApiDepositRequest, AccountId>(body, "destinationAccountId"),
        amount: getRequiredParam<ApiDepositRequest, number>(body, "amount", Number.parseFloat)
    };
}


function transformResult(result: DepositResult): ApiDepositResult {
    // nothing to return
    return {};
}
