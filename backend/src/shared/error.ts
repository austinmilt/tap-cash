import { ApiResponse, ApiResponseStatus as ApiResponseStatus } from "./api";
import { EmailAddress } from "./member";

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


    public static fromApiResponse<T>(response: ApiResponse<T>, httpStatus: number): ApiError {
        if (!this.isErrorResponse(response) || (response.error === undefined)) {
            throw new Error("API response is not an error.")
        }
        return new ApiError(
            response.error.code,
            response.error.message,
            response.status,
            httpStatus
        );
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

    public static invalidParameter(parameter: string): ApiError {
        return new ApiError(
            ApiErrorCode.INVALID_ARGUMENT,
            "Invalid Argument: " + parameter,
            ApiResponseStatus.CLIENT_ERROR,
            400
        );
    }

    public static noSuchMember(member: EmailAddress): ApiError {
        return new ApiError(
            ApiErrorCode.INVALID_ARGUMENT,
            `No such member: ${member}`,
            ApiResponseStatus.CLIENT_ERROR,
            400
        );
    }

    public static memberAlreadyExists(member: EmailAddress): ApiError {
        return new ApiError(
            ApiErrorCode.MEMBER_ALREADY_EXISTS,
            `Member already exists: ${member}`,
            ApiResponseStatus.CLIENT_ERROR,
            400
        );
    }

    public static noCardFound(): ApiError {
        return new ApiError(
            ApiErrorCode.GENERAL_SERVER_ERROR,
            `Error retrieving saved payment methods`,
            ApiResponseStatus.SERVER_ERROR,
            500
        );
    }

    public static solanaTxError(txType: SolanaTxType): ApiError {
        return new ApiError(
            ApiErrorCode.SOLANA_TX_ERROR,
            `Solana transaction Error: ${txType}`,
            ApiResponseStatus.SERVER_ERROR,
            500
        )
    }

    public static solanaQueryError(queryType: SolanaQueryType): ApiError {
        return new ApiError(
            ApiErrorCode.SOLANA_QUERY_ERROR,
            `Solana query Error: ${queryType}`,
            ApiResponseStatus.SERVER_ERROR,
            500
        )
    }


    public static memberSearchError(): ApiError {
        return new ApiError(
            ApiErrorCode.MEMBER_SEARCH_ERROR,
            "Error searching for members.",
            ApiResponseStatus.SERVER_ERROR,
            500
        );
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
    MEMBER_SEARCH_ERROR = 4,
    INVALID_ARGUMENT = 5,
    SOLANA_QUERY_ERROR = 6,
    MEMBER_ALREADY_EXISTS = 7
}

export enum SolanaTxType {
    INITIALIZE_BANK = 0,
    INITIALIZE_MEMBER = 1,
    INITIALIZE_ACCOUNT = 2,
    TRANSFER_TOKEN = 3
}

export enum SolanaQueryType {
    GET_TX_HISTORY = 0,
}
