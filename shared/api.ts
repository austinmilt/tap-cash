import { ApiErrorCode } from "./error";

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
    walletAddressBase58: string;
}


export interface ApiIntializeMemberResponse extends ApiResponse<void> { }
