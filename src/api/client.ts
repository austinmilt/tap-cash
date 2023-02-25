import { useCallback, useMemo, useState } from "react";
import { DEPOSIT_URI, HELLO_WORLD_URI, LIST_CHANNELS_URI, NEW_MEMBER_URI, QUERY_RECIPIENTS_URI, SEND_URI, WITHDRAW_URI } from "../common/constants";
import { ApiDepositRequest, ApiDepositResponse, ApiInitializeMemberRequest, ApiIntializeMemberResponse, ApiQueryRecipientsRequest, ApiQueryRecipientsResponse, ApiResponse, ApiSendRequest, ApiSendResponse, ApiWithdrawRequest, ApiWithdrawResponse, GetQueryParams } from "../../shared/api";
import { AccountId, EmailAddress, ProfilePicture } from "../../shared/member";
import { Currency } from "../../shared/currency";
import * as anchor from "@project-serum/anchor";

interface QueryContext<Req, Res> {
    submit(request: Req): void;
    loading: boolean;
    data: Res | undefined;
    error: Error | undefined
}

export function useHelloWorld(): QueryContext<string, string> {
    const queryContext = useGetQuery<{ name: string }, string>(HELLO_WORLD_URI);
    const submit = useCallback((name: string) => queryContext.submit({ name: name }), [queryContext.submit]);
    return {
        ...queryContext,
        submit: submit
    };
}


export function useListChannels(): QueryContext<void, string> {
    const queryContext = useGetQuery<void, object>(LIST_CHANNELS_URI);
    const data: string | undefined = useMemo(() => (
        queryContext.data == null ? undefined : JSON.stringify(queryContext.data, undefined, 2)
    ), [queryContext.data]);

    return {
        ...queryContext,
        data: data
    };
}


interface InitializeMemberArgs {
    email: EmailAddress;
    wallet: anchor.web3.PublicKey;
}


export function useInitializeMember(): QueryContext<InitializeMemberArgs, void> {
    const queryContext = usePostQuery<ApiInitializeMemberRequest, ApiIntializeMemberResponse>(NEW_MEMBER_URI);

    const submit = useCallback((req: InitializeMemberArgs) => {
        queryContext.submit({
            emailAddress: req.email,
            walletAddressBase58: req.wallet.toBase58()
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
    const queryContext = usePostQuery<ApiDepositRequest, ApiDepositResponse>(DEPOSIT_URI);

    const submit = useCallback((req: DepositArgs) => {
        queryContext.submit({
            emailAddress: req.email,
            destinationAccountId: req.destination,
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
    //TODO probably the sender's private key
}


export function useSend(): QueryContext<SendArgs, void> {
    const queryContext = usePostQuery<ApiSendRequest, ApiSendResponse>(SEND_URI);

    const submit = useCallback((req: SendArgs) => {
        queryContext.submit({
            senderEmailAddress: req.sender,
            recipientEmailAddress: req.recipeient,
            senderAccountId: req.senderAccount,
            amount: req.amount
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
    const queryContext = usePostQuery<ApiWithdrawRequest, ApiWithdrawResponse>(WITHDRAW_URI);

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


type QueryRecipientsData = {
    email: EmailAddress;
    profile: ProfilePicture;
    name: string;
}[];


export function useQueryRecipients(): QueryContext<QueryRecipientsArgs, QueryRecipientsData> {
    const queryContext = useGetQuery<ApiQueryRecipientsRequest, ApiQueryRecipientsResponse>(QUERY_RECIPIENTS_URI);

    const submit = useCallback(({ emailQuery, limit }: QueryRecipientsArgs) => {
        queryContext.submit({
            emailQuery: emailQuery,
            limit: limit.toString()
        });
    }, [queryContext.submit]);


    const data: QueryRecipientsData | undefined = useMemo(() => {
        if (queryContext.data?.result === undefined) return undefined;
        return queryContext.data.result.map(v => ({
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
        fetch(uri)
            .then(response => response.json())
            .then(body => {
                const apiResponse: ApiResponse<Res> = body as ApiResponse<Res>;
                if (apiResponse.error !== undefined) {
                    setError(new Error(`API responded with error: ${apiResponse.error}`));

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
                Accept: 'application/json',
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
