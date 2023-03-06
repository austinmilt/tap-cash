import { ApiErrorCode } from "./error";
import { PaymentMethodSummary } from "./payment";

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


export interface ApiSaveMemberRequest {
    emailAddress: string;
    profilePictureUrl: string;
    name: string;
    signerAddressBase58: string;
}


export interface ApiSaveMemberResult { }

export interface ApiDepositRequest {
    emailAddress: string;
    amount: number;
}


export interface ApiDepositResult { }


export interface ApiSendRequest {
    senderEmailAddress: string;
    recipientEmailAddress: string;
    amount: number;
    privateKey: number[];
}


export interface ApiSendResult { }


export interface ApiWithdrawRequest {
    emailAddress: string;
    sourceAccount: string;
    amount: number;
}


export interface ApiWithdrawResult { }


export interface ApiQueryRecipientsRequest extends GetQueryParams {
    emailQuery: string;
    limit: string;
}


export type ApiQueryRecipientsResult = {
    emailAddress: string;
    profilePicture: string;
    name: string;
}[];

export interface ApiRecentActivityRequest extends GetQueryParams {
    memberEmail: string;
    limit: string;
}


export type ApiRecentActivityResult = ApiMemberActivity[];


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



export interface ApiSavedPaymentMethodsRequest extends GetQueryParams {
    memberEmail: string;
}


export interface ApiSavedPaymentMethodsResult extends Array<PaymentMethodSummary> { }
