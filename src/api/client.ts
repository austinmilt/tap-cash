import { useCallback, useMemo, useState } from "react";
import {
    DEPOSIT_URI,
    SAVE_MEMBER_URI,
    QUERY_RECIPIENTS_URI,
    RECENT_ACTIVITY_URI,
    SAVED_PAYMENT_METHODS_URI,
    SEND_URI,
    WITHDRAW_URI
} from "../common/constants";
import * as anchor from "@project-serum/anchor";
import { MemberActivity } from "../shared/activity";
import {
    ApiDepositRequest,
    ApiSendRequest,
    ApiWithdrawRequest,
    ApiQueryRecipientsRequest,
    ApiRecentActivityRequest,
    GetQueryParams,
    ApiResponse,
    ApiDepositResult,
    ApiSendResult,
    ApiWithdrawResult,
    ApiQueryRecipientsResult
} from "../shared/api";
import { EmailAddress, ProfilePicture, AccountId, MemberPublicProfile } from "../shared/member";
import { PaymentMethodSummary } from "../shared/payment";
import { ApiError } from "../shared/error";

interface QueryContext<Req, Res> {
    submit(request: Req): void;
    loading: boolean;
    data: Res | undefined;
    error: Error | undefined
}


interface SaveMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


/**
 * Adds or updates the member details on the backend, including
 * creating their accounts if needed.
 *
 * @param args
 */
export async function saveMember(args: SaveMemberArgs): Promise<void> {
    await post(SAVE_MEMBER_URI, {
        emailAddress: args.email,
        profilePictureUrl: args.profile,
        name: args.name,
        signerAddressBase58: args.signerAddress.toBase58()
    });
}


interface DepositArgs {
    email: EmailAddress;
    destination: AccountId;
    amount: number;
}


export function useDeposit(): QueryContext<DepositArgs, void> {
    const queryContext = usePostQuery<ApiDepositRequest, ApiDepositResult>(DEPOSIT_URI);

    const submit = useCallback((req: DepositArgs) => {
        queryContext.submit({
            emailAddress: req.email,
            amount: req.amount
        });

    }, [queryContext.submit]);

    return {
        ...queryContext,
        submit: submit,
        data: undefined
    };
}


interface SendArgs {
    sender: EmailAddress;
    recipeient: EmailAddress;
    amount: number;
    privateKey: anchor.web3.Keypair;
}


export function useSend(): QueryContext<SendArgs, void> {
    const queryContext = usePostQuery<ApiSendRequest, ApiSendResult>(SEND_URI);

    const submit = useCallback((req: SendArgs) => {
        queryContext.submit({
            senderEmailAddress: req.sender,
            recipientEmailAddress: req.recipeient,
            amount: req.amount,
            privateKey: Array.from(req.privateKey.secretKey)
        });

    }, [queryContext.submit]);

    return {
        ...queryContext,
        submit: submit,
        data: undefined
    };
}


interface WithdrawArgs {
    email: EmailAddress;
    source: AccountId;
    amount: number;
}


export function useWithdraw(): QueryContext<WithdrawArgs, void> {
    const queryContext = usePostQuery<ApiWithdrawRequest, ApiWithdrawResult>(WITHDRAW_URI);

    const submit = useCallback((req: WithdrawArgs) => {
        queryContext.submit({
            emailAddress: req.email,
            sourceAccount: req.source,
            amount: req.amount
        });

    }, [queryContext.submit]);

    return {
        ...queryContext,
        submit: submit,
        data: undefined
    };
}


interface QueryRecipientsArgs {
    emailQuery: string;
    limit: number;
}


export function useQueryRecipients(): QueryContext<QueryRecipientsArgs, MemberPublicProfile[]> {
    const queryContext = useGetQuery<ApiQueryRecipientsRequest, ApiQueryRecipientsResult>(QUERY_RECIPIENTS_URI);

    const submit = useCallback(({ emailQuery, limit }: QueryRecipientsArgs) => {
        queryContext.submit({
            emailQuery: emailQuery,
            limit: limit.toString()
        });
    }, [queryContext.submit]);


    const data: MemberPublicProfile[] | undefined = useMemo(() => {
        if (queryContext.data === undefined) return undefined;
        return queryContext.data.map(v => ({
            email: v.emailAddress,
            profile: v.profilePicture,
            name: v.name
        }));
    }, [queryContext.data]);

    return {
        ...queryContext,
        submit: submit,
        data: data
    };
}



interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}


export function useRecentActivity(): QueryContext<RecentActivityArgs, MemberActivity[]> {
    const queryContext = useGetQuery<ApiRecentActivityRequest, MemberActivity[]>(RECENT_ACTIVITY_URI);

    const submit = useCallback(({ memberEmail, limit }: RecentActivityArgs) => {
        queryContext.submit({
            memberEmail: memberEmail,
            limit: limit.toString()
        });
    }, [queryContext.submit]);


    const data: MemberActivity[] | undefined = useMemo(() => {
        if (queryContext.data === undefined) return undefined;
        return queryContext.data.map(v => v as MemberActivity);
    }, [queryContext.data]);

    return {
        ...queryContext,
        submit: submit,
        data: data
    };
}


interface SavedPaymentMethodsArgs {
    memberEmail: EmailAddress;
}


export function useSavedPaymentMethods(): QueryContext<SavedPaymentMethodsArgs, PaymentMethodSummary[]> {
    const queryContext = useGetQuery<ApiRecentActivityRequest, PaymentMethodSummary[]>(SAVED_PAYMENT_METHODS_URI);

    const submit = useCallback(({ memberEmail, limit }: RecentActivityArgs) => {
        queryContext.submit({
            memberEmail: memberEmail,
            limit: limit.toString()
        });
    }, [queryContext.submit]);


    const data: PaymentMethodSummary[] | undefined = useMemo(() => {
        if (queryContext.data === undefined) return undefined;
        return queryContext.data.map(v => v as PaymentMethodSummary);
    }, [queryContext.data]);

    return {
        ...queryContext,
        submit: submit,
        data: data
    };
}


function useGetQuery<Req extends GetQueryParams | void, Res>(baseUri: string): QueryContext<Req, Res> {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Res | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const submit: (params: Req) => void = useCallback(async (params) => {
        setLoading(true);
        let uri: string = baseUri;
        if (params !== undefined) {
            uri += `?${new URLSearchParams(params)}`
        }
        fetch(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(async response => [await response.json(), response.status])
            .then(([body, httpStatus]) => {
                const apiResponse: ApiResponse<Res> = body as ApiResponse<Res>;
                if (apiResponse.error !== undefined) {
                    setError(ApiError.fromApiResponse(apiResponse, httpStatus));

                } else {
                    setData(apiResponse.result);
                }
            })
            .catch(e => {
                setError(e);
            })
            .finally(() => setLoading(false));
    }, [baseUri]);

    return {
        loading: loading,
        error: error,
        data: data,
        submit: submit
    }
}


function usePostQuery<Req, Res>(baseUri: string): QueryContext<Req, Res> {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Res | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const submit: (body: Req) => void = useCallback((body) => {
        setLoading(true);
        // https://reactnative.dev/docs/network
        post<Req, Res>(baseUri, body)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [baseUri]);

    return {
        loading: loading,
        error: error,
        data: data,
        submit: submit
    }
}


async function post<Req, Res>(baseUri: string, body: Req): Promise<Res> {
    let uri: string = baseUri;
    // https://reactnative.dev/docs/network
    const response = await fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        // TODO more robust conversion of body
        body: JSON.stringify(body),
    });

    const responseBody = await response.json();
    const apiResponse: ApiResponse<Res> = responseBody as ApiResponse<Res>;
    if (apiResponse.error !== undefined) {
        throw new Error(`API responded with error: ${apiResponse.error.message}`);
    }

    if (apiResponse.result == null) {
        throw new Error("API response is empty.");
    }

    return apiResponse.result;
}
