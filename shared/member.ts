export type EmailAddress = string;
export type MemberId = string;
export type AccountId = string;
export type ProfilePicture = string;

export interface MemberPublicProfile {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
}
