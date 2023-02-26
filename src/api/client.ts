import { useCallback, useMemo, useState } from "react";
import {
    DEPOSIT_URI,
    HELLO_WORLD_URI,
    LIST_CHANNELS_URI,
    NEW_MEMBER_URI,
    QUERY_RECIPIENTS_URI,
    RECENT_ACTIVITY_URI,
    SEND_URI,
    WITHDRAW_URI
} from "../common/constants";
import * as anchor from "@project-serum/anchor";
import { MemberActivity } from "../../backend/src/shared/activity";
import {
    ApiInitializeMemberRequest,
    ApiIntializeMemberResponse,
    ApiDepositRequest,
    ApiDepositResponse,
    ApiSendRequest,
    ApiSendResponse,
    ApiWithdrawRequest,
    ApiWithdrawResponse,
    ApiQueryRecipientsRequest,
    ApiRecentActivityRequest,
    GetQueryParams,
    ApiResponse
} from "../../backend/src/shared/api";
import { EmailAddress, ProfilePicture, AccountId, MemberPublicProfile } from "../../backend/src/shared/member";
import { ApiQueryRecipientsData } from "@tap/shared/api";

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
    profile: ProfilePicture;
    name: string;
    signerAddress: anchor.web3.PublicKey;
}


export function useInitializeMember(): QueryContext<InitializeMemberArgs, void> {
    const queryContext = usePostQuery<ApiInitializeMemberRequest, ApiIntializeMemberResponse>(NEW_MEMBER_URI);

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


export function useQueryRecipients(): QueryContext<QueryRecipientsArgs, MemberPublicProfile[]> {
    const queryContext = useGetQuery<ApiQueryRecipientsRequest, ApiQueryRecipientsData>(QUERY_RECIPIENTS_URI);

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
        fetch(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
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
