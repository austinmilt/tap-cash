import { ApiDepositRequest, ApiDepositResult, ApiResponseStatus } from "../shared/api";
import { EmailAddress } from "../shared/member";
import { getRequiredParam, makePostHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";

//TODO tests


export interface DepositArgs {
    emailAddress: EmailAddress;
    amount: number;
}


export interface DepositResult {
}

export const handleDeposit = makePostHandler(deposit, transformRequest, transformResult);


async function deposit(request: DepositArgs): Promise<DepositResult> {
    const { usdcAddress } = await getDatabaseClient().getMemberPrivateProfile(request.emailAddress);


    try {
        await getCircleClient().depositUsdc({
            destinationAtaString: usdcAddress.toString(),
            amount: request.amount,
            member: request.emailAddress,
            cardId: "1", //TODO ignored atm
            cardCvv: "123", //TODO ignored atm
        });
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
        amount: getRequiredParam<ApiDepositRequest, number>(body, "amount", Number.parseFloat)
    };
}


function transformResult(result: DepositResult): ApiDepositResult {
    // nothing to return
    return {};
}
