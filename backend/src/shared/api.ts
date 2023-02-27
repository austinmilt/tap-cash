import { ApiErrorCode } from "./error";
import * as anchor from "@project-serum/anchor";

export interface GetQueryParams {
    [param: string]: string;
}

export interface ApiResponse<T> {
    result?: T;
    error?: {
        code: ApiErrorCode;
        message: string;
    };
    status: ApiResponseStatus;
}


export enum ApiResponseStatus {
    SUCCESS = 1,
    CLIENT_ERROR = 2,
    SERVER_ERROR = 3
}


export interface ApiInitializeMemberRequest {
    emailAddress: string;
    profilePictureUrl: string;
    name: string;
    signerAddressBase58: string;
}


export interface ApiIntializeMemberResponse extends ApiResponse<void> { }


export interface ApiDepositRequest {
    emailAddress: string;
    destinationAccountId: string;
    amount: number;
    //TODO
}


export interface ApiDepositResponse extends ApiResponse<void> { }


export interface ApiSendRequest {
    senderEmailAddress: string;
    recipientEmailAddress: string;
    senderAccountId: string;
    amount: number;
    privateKey: anchor.web3.Keypair
}


export interface ApiSendResponse extends ApiResponse<void> { }


export interface ApiWithdrawRequest {
    emailAddress: string;
    sourceAccount: string;
    amount: number;
    //TODO
}


export interface ApiWithdrawResponse extends ApiResponse<void> { }


export interface ApiQueryRecipientsRequest extends GetQueryParams {
    emailQuery: string;
    limit: string;
}


export type ApiQueryRecipientsData = {
    emailAddress: string;
    profilePicture: string;
    name: string;
}[];


export interface ApiQueryRecipientsResponse extends ApiResponse<ApiQueryRecipientsData> { }


export interface ApiRecentActivityRequest extends GetQueryParams {
    memberEmail: string;
    limit: string;
}


export interface ApiRecentActivityResponse extends ApiResponse<ApiMemberActivity[]> { }


export interface ApiMemberActivity {
    type: number;
    deposit?: ApiDepositActivity;
    send?: ApiSendActivity;
    receive?: ApiReceiveActivity;
    withdraw?: ApiWithdrawActivity;
}

export interface ApiDepositActivity {
    account: string;
    currency: string;
    amount: number;
}


export interface ApiSendActivity {
    recipient: ApiMemberPublicProfile;
    currency: string;
    amount: number;
}


export interface ApiReceiveActivity {
    sender: ApiMemberPublicProfile;
    currency: string;
    amount: number;
}


export interface ApiWithdrawActivity {
    source: string;
    currency: string;
    amount: number;
}


export interface ApiMemberPublicProfile {
    email: string;
    profile: string;
    name: string;
}
