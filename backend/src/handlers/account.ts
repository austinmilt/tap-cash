
import { ApiAccountRequest, ApiAccountResult } from "../shared/api";
import { getRequiredParam, makeGetHandler } from "./model";
import { getDatabaseClient } from "../helpers/singletons";
import { EmailAddress, MemberPrivateProfile } from "../shared/member";

/**
 * Arguments for the getAccount handler.
 */
interface AccountArgs {
    /* Member email address */
    member: EmailAddress;
}


//TODO this needs to have authentication even though we're not (yet) sharing
// anything too sensitive
export const handleAccount = makeGetHandler(getAccount, transformRequest, transformResult);

/**
 * 
 * Fetch a member's private profile from the Database Client
 * 
 * @param request AccountArgs - the request arguments
 * @returns a Member's private profile
 */
async function getAccount(request: AccountArgs): Promise<MemberPrivateProfile> {
    return await getDatabaseClient().getMemberPrivateProfile(request.member);
}

/**
 * 
 * Transform the request parameters into the arguments for the getAccount handler
 * 
 * @param params ApiAccountRequest - the request parameters
 * @returns AccountArgs - the formatted request arguments
 */
function transformRequest(params: ApiAccountRequest): AccountArgs {
    return {
        member: getRequiredParam<ApiAccountRequest, string>(params, "memberEmail")
    };
}

/**
 * 
 * Transform the result of the getAccount handler into the response format
 * 
 * @param result MemberPrivateProfile - the result of the getAccount handler
 * @returns ApiAccountResult - the formatted response
 */
function transformResult(result: MemberPrivateProfile): ApiAccountResult {
    return {
        email: result.email,
        name: result.name,
        profile: result.profile,
        signerAddress: result.signerAddress.toBase58(),
        usdcAddress: result.usdcAddress.toBase58()
    };
}
