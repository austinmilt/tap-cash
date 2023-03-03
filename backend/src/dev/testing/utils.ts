import * as ff from "@google-cloud/functions-framework";

export function buildPostRequest<T extends ff.Request['body']>(body: T): ff.Request {
    // Our handlers use very little of the request object, so
    // we can get away with just spoofing it. If we tried to use
    // this on a live local server, it would break.
    return {
        body: body,
    } as unknown as ff.Request;
}


export function buildGetRequest<T extends ff.Request['query']>(params: T): ff.Request {
    // Our handlers use very little of the request object, so
    // we can get away with just spoofing it. If we tried to use
    // this on a live local server, it would break.
    return {
        query: params,
    } as unknown as ff.Request;
}
