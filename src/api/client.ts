import { useCallback, useEffect, useMemo, useState } from "react";
import {
    DEPOSIT_URI,
    SAVE_MEMBER_URI,
    QUERY_RECIPIENTS_URI,
    RECENT_ACTIVITY_URI,
    SAVED_PAYMENT_METHODS_URI,
    SEND_URI,
    WITHDRAW_URI,
    MEMBER_ACCOUNT_URI
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
    ApiQueryRecipientsResult,
    ApiAccountRequest,
    ApiAccountResult,
    ApiSavedPaymentMethodsRequest
} from "../shared/api";
import { PublicKey } from "../solana/solana";
import { IMAGES } from "../images/images";
import { EmailAddress, ProfilePicture, MemberPrivateProfile, AccountId, MemberPublicProfile } from "../shared/member";
import { PaymentMethodSummary, PaymentMethodType, CreditCardCarrier } from "../shared/payment";

interface QueryContext<Req, Res> {
    submit(request: Req): void;
    loading: boolean;
    data: Res | undefined;
    error: Error | undefined
}


export interface SaveMemberArgs {
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


interface GetMemberArgs {
    member: EmailAddress;
}


/**
 * Gets the saved member details from the backend
 *
 * @param args
 */
export async function getMember(args: GetMemberArgs): Promise<MemberPrivateProfile> {
    //TODO error handling
    const result = await get<ApiAccountRequest, ApiAccountResult>(MEMBER_ACCOUNT_URI, { memberEmail: args.member });
    return {
        email: result.email,
        profile: result.profile,
        name: result.name,
        usdcAddress: new PublicKey(result.usdcAddress),
        signerAddress: new PublicKey(result.signerAddress)
    };
}


interface DepositArgs {
    email: EmailAddress;
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
    recipient: EmailAddress;
    amount: number;
    privateKey: anchor.web3.Keypair;
}


export function useSend(): QueryContext<SendArgs, void> {
    const queryContext = usePostQuery<ApiSendRequest, ApiSendResult>(SEND_URI);

    const submit = useCallback((req: SendArgs) => {
        queryContext.submit({
            senderEmailAddress: req.sender,
            recipientEmailAddress: req.recipient,
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


interface DepositAndSendArgs {
    sender: EmailAddress;
    recipient: EmailAddress;
    amount: number;
    depositAmount: number;
    senderSigner: anchor.web3.Keypair;
}


interface DepositAndSendContext {
    deposit: {
        loading: boolean;
        success: boolean | undefined;
        error: Error | undefined;
    };
    send: {
        loading: boolean;
        success: boolean | undefined;
        error: Error | undefined;
    };
    submit: (args: DepositAndSendArgs) => void;
}


export function useDepositAndSend(): DepositAndSendContext {
    const [args, setArgs] = useState<DepositAndSendArgs | undefined>();

    const [depositSuccess, setDepositSuccess] = useState<boolean | undefined>();
    const [startDeposit, setStartDeposit] = useState<boolean>(false);
    const [depositLoading, setDepositLoading] = useState<boolean>(false);
    const [depositError, setDepositError] = useState<Error | undefined>();

    const [sendSuccess, setSendSuccess] = useState<boolean | undefined>();
    const [startSend, setStartSend] = useState<boolean>(false);
    const [sendLoading, setSendLoading] = useState<boolean>(false);
    const [sendError, setSendError] = useState<Error | undefined>();

    // separating deposit and send into separate useEffect means
    // we can incrementally update the UI as each completes asynchronously
    useEffect(() => {
        // checking for depositSuccess to be defined means we only try once
        if (startDeposit && (depositSuccess === undefined) && (args !== undefined)) {
            setDepositLoading(true);
            post<ApiDepositRequest, ApiDepositResult>(DEPOSIT_URI, {
                emailAddress: args.sender,
                amount: args.depositAmount
            })
                .then(() => {
                    setDepositSuccess(true);
                    setStartSend(true);
                })
                .catch(setDepositError)
                .finally(() => {
                    setStartDeposit(false);
                    setDepositLoading(false);
                })
        }
    }, [startDeposit]);

    useEffect(() => {
        // checking for sendSuccess to be defined means we only try once
        if (startSend && (sendSuccess === undefined) && (args !== undefined)) {
            setSendLoading(true);
            post<ApiSendRequest, ApiSendResult>(SEND_URI, {
                senderEmailAddress: args.sender,
                recipientEmailAddress: args.recipient,
                amount: args.amount,
                privateKey: Array.from(args.senderSigner.secretKey)
            })
                .then(() => setSendSuccess(true))
                .catch(setSendError)
                .finally(() => {
                    setStartSend(false);
                    setSendLoading(false);
                })
        }
    }, [startSend]);

    const submit: (args: DepositAndSendArgs) => void = useCallback(async (args) => {
        setArgs(args);
        if (args.depositAmount > 0) {
            setStartDeposit(true);

        } else {
            setStartSend(true);
        }
    }, [setArgs, setStartDeposit]);


    return {
        deposit: {
            success: depositSuccess,
            loading: depositLoading,
            error: depositError
        },
        send: {
            success: sendSuccess,
            loading: sendLoading,
            error: sendError
        },
        submit: submit
    }
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


export interface EnrichedPaymentMethodSummary extends PaymentMethodSummary {
    iconSource: {
        mini: string;
        square: string;
    }
}


export function useSavedPaymentMethods(): QueryContext<SavedPaymentMethodsArgs, EnrichedPaymentMethodSummary[]> {
    const queryContext = useGetQuery<ApiSavedPaymentMethodsRequest, EnrichedPaymentMethodSummary[]>(SAVED_PAYMENT_METHODS_URI);

    const submit = useCallback(({ memberEmail }: SavedPaymentMethodsArgs) => {
        queryContext.submit({
            memberEmail: memberEmail
        });
    }, [queryContext.submit]);


    const data: EnrichedPaymentMethodSummary[] | undefined = useMemo(() => {
        if (queryContext.data === undefined) return undefined;
        return queryContext.data.map(v => ({
            ...v,
            iconSource: getPaymentMethodIconSource(v)
        }));
    }, [queryContext.data]);

    return {
        ...queryContext,
        submit: submit,
        data: data
    };
}


function getPaymentMethodIconSource(method: PaymentMethodSummary): EnrichedPaymentMethodSummary['iconSource'] {
    switch (method.type) {
        case PaymentMethodType.CREDIT_CARD: {
            switch (method.creditCard?.carrier) {
                case CreditCardCarrier.VISA: return {
                    mini: IMAGES.payments.visaMini,
                    square: IMAGES.payments.visaSquare
                }

                default: return {
                    mini: IMAGES.payments.unknownMini,
                    square: IMAGES.payments.unknownSquare
                }
            }
        }

        default: throw new Error("Cannot process " + PaymentMethodType[method.type]);
    }
}


function useGetQuery<Req extends GetQueryParams | void, Res>(baseUri: string): QueryContext<Req, Res> {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<Res | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const submit: (params: Req) => void = useCallback(async (params) => {
        setLoading(true);
        get<Req, Res>(baseUri, params)
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


async function get<Req extends GetQueryParams | void, Res>(baseUri: string, params: Req): Promise<Res> {
    let uri: string = baseUri;
    if (params !== undefined) {
        uri += `?${new URLSearchParams(params)}`
    }
    // https://reactnative.dev/docs/network
    const response = await fetch(uri, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })

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
