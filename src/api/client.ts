import { useCallback, useMemo, useState } from "react";
import {
    DEPOSIT_URI,
    NEW_MEMBER_URI,
    QUERY_RECIPIENTS_URI,
    RECENT_ACTIVITY_URI,
    SAVED_PAYMENT_METHODS_URI,
    SEND_URI,
    WITHDRAW_URI
} from "../common/constants";
import * as anchor from "@project-serum/anchor";
import { MemberActivity } from "../shared/activity";
import {
    ApiInitializeMemberRequest,
    ApiDepositRequest,
    ApiSendRequest,
    ApiWithdrawRequest,
    ApiQueryRecipientsRequest,
    ApiRecentActivityRequest,
    GetQueryParams,
    ApiResponse,
    ApiInitializeMemberResult,
    ApiDepositResult,
    ApiSendResult,
    ApiWithdrawResult,
    ApiQueryRecipientsResult
} from "../shared/api";
import { EmailAddress, ProfilePicture, AccountId, MemberPublicProfile } from "../shared/member";
import { PaymentMethodSummary } from "../shared/payment";

interface QueryContext<Req, Res> {
    submit(request: Req): void;
    loading: boolean;
    data: Res | undefined;
    error: Error | undefined
}


interface InitializeMemberArgs {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


export function useInitializeMember(): QueryContext<InitializeMemberArgs, void> {
    const queryContext = usePostQuery<ApiInitializeMemberRequest, ApiInitializeMemberResult>(NEW_MEMBER_URI);

    const submit = useCallback((req: InitializeMemberArgs) => {
        queryContext.submit({
            emailAddress: req.email,
            profilePictureUrl: req.profile,
            name: req.name,
            signerAddressBase58: req.signerAddress.toBase58()
        });

    }, [queryContext.submit]);

    return {
        ...queryContext,
        submit: submit,
        data: undefined
    };
}


interface DepositArgs {
    email: EmailAddress;
    destination: AccountId;
    amount: number;
    //TODO something about handling credit card info
    //TODO probably the user's private key
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
    senderAccount: AccountId;
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
    //TODO probably the user's private key
    //TODO something about destination bank account
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

    const submit: (params: Req) => void = useCallback((params) => {
        setLoading(true);
        let uri: string = baseUri;
        if (params !== undefined) {
            uri += `?${new URLSearchParams(params)}`
        }
        console.log("FETCH", uri);
        fetch(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(response => { console.log(response); return response.json() })
            .then(body => {
                console.log(body);
                const apiResponse: ApiResponse<Res> = body as ApiResponse<Res>;
                console.log(apiResponse);
                if (apiResponse.error !== undefined) {
                    setError(new Error(`API responded with error: ${apiResponse.error}`));

                } else {
                    setData(apiResponse.result);
                }
            })
            .catch(e => {
                setError(e);
                console.error(e, (e as unknown as Error).message);
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
        let uri: string = baseUri;
        // https://reactnative.dev/docs/network
        fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            // TODO more robust conversion of body
            body: JSON.stringify(body),
        })
            .then(response => response.json())
            .then(body => {
                const apiResponse: ApiResponse<Res> = body as ApiResponse<Res>;
                if (apiResponse.error !== undefined) {
                    setError(new Error(`API responded with error: ${apiResponse.error.message}`));

                } else {
                    setData(apiResponse.result);
                }
            })
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
