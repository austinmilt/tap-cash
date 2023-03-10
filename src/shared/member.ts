import { PublicKey } from "../helpers/solana";

export type EmailAddress = string;
export type MemberId = string;
export type AccountId = string;
export type ProfilePicture = string;

export interface MemberPublicProfile {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
}


export interface MemberPrivateProfile {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: PublicKey;
    usdcAddress: PublicKey;
}
