import { ApiDepositRequest, ApiDepositResult, ApiResponseStatus } from "../shared/api";
import { CircleEmulator } from "../circle/circle-emulator";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { EmailAddress, AccountId } from "../shared/member";
import { CircleClient } from "../circle/client";
import { getRequiredParam, makePostHandler } from "./model";

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

const CIRCLE_CLIENT: CircleClient = CircleEmulator.ofDefaults();
const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();


export const handleDeposit = makePostHandler(deposit, transformRequest, transformResult);


async function deposit(request: DepositArgs): Promise<DepositResult> {
    // TODO: delegate the credit card retrieval and processing to Circle client

    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.emailAddress);

    try {
        await CIRCLE_CLIENT.transferUsdc({ destinationAtaString: usdcAddress.toString(), amount: request.amount });
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
