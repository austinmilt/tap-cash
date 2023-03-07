
import { ApiAccountRequest, ApiAccountResult } from "../shared/api";
import { getRequiredParam, makeGetHandler } from "./model";
import { getDatabaseClient } from "../helpers/singletons";
import { EmailAddress, MemberPrivateProfile } from "../shared/member";

interface AccountArgs {
    member: EmailAddress;
}


//TODO this needs to have authentication even though we're not (yet) sharing
// anything too sensitive
export const handleAccount = makeGetHandler(getAccount, transformRequest, transformResult);

async function getAccount(request: AccountArgs): Promise<MemberPrivateProfile> {
    return await getDatabaseClient().getMemberPrivateProfile(request.member);
}


function transformRequest(params: ApiAccountRequest): AccountArgs {
    return {
        member: getRequiredParam<ApiAccountRequest, string>(params, "memberEmail")
    };
}


function transformResult(result: MemberPrivateProfile): ApiAccountResult {
    return {
        email: result.email,
        name: result.name,
        profile: result.profile,
        signerAddress: result.signerAddress.toBase58(),
        usdcAddress: result.usdcAddress.toBase58()
    };
}
