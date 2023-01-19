import { useCallback, useMemo, useState } from "react";
import { HELLO_WORLD_URI, LIST_CHANNELS_URI } from "../common/constants";

interface QueryContext<Req, Res> {
    submit(request: Req): void;
    loading: boolean;
    data: Res | undefined;
    error: Error | undefined
}

export function useHelloWorld(): QueryContext<string, string> {
    const queryContext = useGetQuery<{name: string}, string>(HELLO_WORLD_URI);
    const submit = useCallback((name: string) => queryContext.submit({name: name}), [queryContext.submit]);
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


interface GetQueryParams {
    [param: string]: string;
}


function useGetQuery<Req extends GetQueryParams | void, Res>(baseUri: string): QueryContext<Req, Res>  {
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
                    setError(new Error (`API responded with error: ${apiResponse.error}`));

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


interface ApiResponse<T> {
    result: T | undefined;
    error: string | undefined;
}
