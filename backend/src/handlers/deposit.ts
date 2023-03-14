import { ApiDepositRequest, ApiDepositResult, ApiResponseStatus } from "../shared/api";
import { EmailAddress } from "../shared/member";
import { getRequiredParam, makePostHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";

export interface DepositArgs {
    /* Member email address */
    emailAddress: EmailAddress;
    /* Amount to deposit */
    amount: number;
}

/**
 * Result of the deposit handler. (void)
 */
export interface DepositResult {
}

export const handleDeposit = makePostHandler(deposit, transformRequest, transformResult);

/**
 *
 * Deposit funds into a member's account
 *
 * @param request DepositArgs - the request arguments
 * @returns DepositResult - the result of the deposit handler (void)
 * @throws SERVER_ERROR - if the deposit fails
 */
async function deposit(request: DepositArgs): Promise<DepositResult> {
    const { usdcAddress } = await getDatabaseClient().getMemberPrivateProfile(request.emailAddress);

    await getCircleClient().depositUsdc({
        destinationAtaString: usdcAddress.toString(),
        amount: request.amount,
        member: request.emailAddress,
        cardId: "1", //TODO ignored atm
        cardCvv: "123", //TODO ignored atm
    });
    return {};
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
