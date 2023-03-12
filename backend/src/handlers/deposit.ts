import { ApiDepositRequest, ApiDepositResult, ApiResponseStatus } from "../shared/api";
import { EmailAddress } from "../shared/member";
import { getRequiredParam, makePostHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";

//TODO tests

/**
 * Arguments for the deposit handler.
 */
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

/**
 * 
 * Transform the request parameters into the arguments for the deposit handler
 * 
 * @param body ApiDepositRequest - the request parameters
 * @returns DepositArgs - the formatted request arguments
 */
function transformRequest(body: ApiDepositRequest): DepositArgs {
    return {
        emailAddress: getRequiredParam<ApiDepositRequest, EmailAddress>(body, "emailAddress"),
        amount: getRequiredParam<ApiDepositRequest, number>(body, "amount", Number.parseFloat)
    };
}

/**
 * 
 * Transform the result of the deposit handler into the response format
 * 
 * @param result DepositResult - the result of the deposit handler
 * @returns ApiDepositResult - the formatted response (void) 
 */
function transformResult(result: DepositResult): ApiDepositResult {
    // nothing to return
    return {};
}
