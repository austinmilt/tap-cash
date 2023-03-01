import * as anchor from "@project-serum/anchor";
import { v4 as uuid } from "uuid";
import { EmailAddress, ProfilePicture, MemberId } from "../shared/member";
import { ApiError, SolanaTxType } from "../shared/error";
import { TapCashClient } from "../program/sdk";
import { getPublicKeyParam, getRequiredParam, makePostHandler } from "./model";
import { ApiInitializeMemberRequest, ApiInitializeMemberResult } from "../shared/api";
import { getDatabaseClient } from "../helpers/singletons";

//TODO tests

interface InitializeMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


interface InitializeMemberResult {
    memberId: MemberId;
}


export const handleNewMember = makePostHandler(initializeMember, transformRequest, transformResult);

//TODO eventually we should periodically sync users' email, name, and picture
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

async function initializeMember(request: InitializeMemberArgs): Promise<InitializeMemberResult> {
    let userAta = await TAP_CLIENT.initializeNewMember(request.signerAddress);

    if (!userAta) throw ApiError.solanaTxError(SolanaTxType.INITIALIZE_BANK);

    // TODO: store mapping from user's email to name, pfp, wallet, and ATA
    getDatabaseClient().addMember(
        {
            email: request.email,
            profile: request.profile,
            name: request.name
        },
        request.signerAddress,
        userAta
    );

    return {
        memberId: uuid()
    }
}



function transformRequest(body: ApiInitializeMemberRequest): InitializeMemberArgs {
    return {
        email: getRequiredParam<ApiInitializeMemberRequest, EmailAddress>(body, "emailAddress"),
        profile: getRequiredParam<ApiInitializeMemberRequest, ProfilePicture>(body, "profilePictureUrl"),
        name: getRequiredParam<ApiInitializeMemberRequest, string>(body, "name"),
        signerAddress: getPublicKeyParam<ApiInitializeMemberRequest>(body, "signerAddressBase58")
    };
}


function transformResult(result: InitializeMemberResult): ApiInitializeMemberResult {
    // nothing to return
    return {};
}
