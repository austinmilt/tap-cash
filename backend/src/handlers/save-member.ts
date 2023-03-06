import * as anchor from "@project-serum/anchor";
import { EmailAddress, ProfilePicture, MemberId } from "../shared/member";
import { ApiError, SolanaTxType } from "../shared/error";
import { getPublicKeyParam, getRequiredParam, makePostHandler } from "./model";
import { ApiInitializeMemberRequest, ApiInitializeMemberResult } from "../shared/api";
import { getDatabaseClient, getTapCashClient } from "../helpers/singletons";
import { DatabaseClient } from "../db/client";


interface SaveMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


interface SaveMemberResult {
    memberId: MemberId;
}


export const handleSaveMember = makePostHandler(saveMember, transformRequest, transformResult);

async function saveMember(request: SaveMemberArgs): Promise<SaveMemberResult> {
    const dbClient: DatabaseClient = getDatabaseClient();

    if (await dbClient.isMember(request.email)) {
        return { memberId: await dbClient.updateMember(request) };
    }

    let userAta = await getTapCashClient().initializeNewMember(request.signerAddress);

    if (!userAta) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);

    const memberId: string = await dbClient.addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        request.signerAddress,
        userAta
    );

    return { memberId: memberId };
}



function transformRequest(body: ApiInitializeMemberRequest): SaveMemberArgs {
    return {
        email: getRequiredParam<ApiInitializeMemberRequest, EmailAddress>(body, "emailAddress"),
        profile: getRequiredParam<ApiInitializeMemberRequest, ProfilePicture>(body, "profilePictureUrl"),
        name: getRequiredParam<ApiInitializeMemberRequest, string>(body, "name"),
        signerAddress: getPublicKeyParam<ApiInitializeMemberRequest>(body, "signerAddressBase58")
    };
}


function transformResult(result: SaveMemberResult): ApiInitializeMemberResult {
    // nothing to return
    return {};
}
