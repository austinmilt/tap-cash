import { ApiResponse, ApiResponseStatus as ApiResponseStatus } from "./api";

export class ApiError extends Error {
    public readonly code: ApiErrorCode;
    public readonly message: string;
    public readonly responseStatus: ApiResponseStatus;
    public readonly httpStatus: number;

    private constructor(
        code: ApiErrorCode,
        message: string,
        responseStatus: ApiResponseStatus,
        httpStatus: number
    ) {
        super(message);
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
        this.responseStatus = responseStatus;
    }


    public static fromApiResponse<T>(response: ApiResponse<T>): ApiError {
        if (!this.isErrorResponse(response)) {
            throw new Error("API response is not an error.")
        }
        switch (response.error?.code) {
            case 0: {
                return this.generalServerError(response.error.message);
            }

            default: {
                throw new Error("Unrecognized error code " + response.error?.code);
            }
        }
    }


    public static generalServerError(message: string): ApiError {
        return new ApiError(
            ApiErrorCode.GENERAL_SERVER_ERROR,
            message,
            ApiResponseStatus.SERVER_ERROR,
            500
        );
    }


    public static generalClientError(message: string): ApiError {
        return new ApiError(
            ApiErrorCode.GENERAL_CLIENT_ERROR,
            message,
            ApiResponseStatus.CLIENT_ERROR,
            400
        );
    }


    public static missingParameter(parameter: string): ApiError {
        return new ApiError(
            ApiErrorCode.MISSING_PARAMETER,
            "Missing required parameter " + parameter,
            ApiResponseStatus.CLIENT_ERROR,
            400
        );
    }

    public static solanaTxError(): ApiError {
        return new ApiError(
            ApiErrorCode.SOLANA_TX_ERROR,
            "Solana transaction Error",
            ApiResponseStatus.SERVER_ERROR,
            500
        )
    }


    public static isErrorResponse(response: ApiResponse<unknown>): boolean {
        return (response.error !== undefined);
    }


    public toApiResponse<T>(): ApiResponse<T> {
        return {
            error: {
                code: this.code,
                message: this.message
            },
            status: this.responseStatus
        };
    }

}


export enum ApiErrorCode {
    GENERAL_SERVER_ERROR = 0,
    GENERAL_CLIENT_ERROR = 1,
    MISSING_PARAMETER = 2,
    SOLANA_TX_ERROR = 3,
}
