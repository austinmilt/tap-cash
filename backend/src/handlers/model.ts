// Google Cloud Functions Framework main entrypoint
import * as ff from '@google-cloud/functions-framework';
import { ApiResponseStatus } from '../shared/api';
import { ApiError } from '../shared/error';
import { Keypair, PublicKey } from '../helpers/solana';

export type PostParams = ff.Request['body'];
export type GetParams = ff.Request['query'];
export type HttpResult = Record<string, any>;

interface GetRequestTransformer<T extends GetParams, U> {
    (request: T): U;
}


interface PostRequestTransformer<T extends PostParams, U> {
    (request: T): U;
}


interface ResultTransformer<T, U extends HttpResult> {
    (result: T): U;
}


export function makeGetHandler<RequestApi extends GetParams, ResultApi extends HttpResult, Request, Result>(
    handler: (request: Request) => Promise<Result>,
    transformRequest: GetRequestTransformer<RequestApi, Request>,
    transformResult: ResultTransformer<Result, ResultApi>
): ff.HttpFunction {
    // @ts-ignore we will always use a safe version of QueryString.ParsedQs
    return makeHandler(handler, req => transformRequest(req.query), transformResult);
}


export function makePostHandler<RequestApi extends PostParams, ResultApi extends HttpResult, Request, Result>(
    handler: (request: Request) => Promise<Result>,
    transformRequest: PostRequestTransformer<RequestApi, Request>,
    transformResult: ResultTransformer<Result, ResultApi>
): ff.HttpFunction {
    return makeHandler(handler, req => transformRequest(req.body), transformResult);
}


function makeHandler<Request, Result, ResultApi extends HttpResult>(
    handler: (request: Request) => Promise<Result>,
    transformRequest: (request: ff.Request) => Request,
    transformResult: ResultTransformer<Result, ResultApi>
): ff.HttpFunction {
    return async (req, res) => {
        try {
            const request: Request = transformRequest(req);
            const result: Result = await handler(request);
            respondOK(res, transformResult(result));

        } catch (e) {
            handleError(res, e as unknown as ApiError | Error);
        }
    }
}


export function getRequiredIntegerParam<R>(params: ff.Request['body'] | ff.Request['query'], key: keyof R): number {
    return getRequiredParam<R, number>(params, key, Number.parseInt);
}


export function getPublicKeyParam<R>(params: ff.Request['body'] | ff.Request['query'], key: keyof R): PublicKey {
    return getRequiredParam<R, PublicKey>(params, key, v => new PublicKey(v));
}


export function getPrivateKeyParam<R>(params: ff.Request['body'] | ff.Request['query'], key: keyof R): Keypair {
    return getRequiredParam<R, Keypair>(params, key, v => Keypair.fromSecretKey(new Uint8Array(v)));
}


export function getRequiredParam<R, T>(
    params: ff.Request['body'] | ff.Request['query'],
    key: keyof R,
    parse?: (value: any) => T
): T {
    const candidate: T | undefined = getParam<R, T>(params, key, parse);
    if (candidate === undefined) {
        throw ApiError.missingParameter(key as string);
    }
    return candidate;
}


function getParam<R, T>(
    params: ff.Request['body'] | ff.Request['query'],
    key: keyof R,
    parse: (value: any) => T = value => value as T
): T | undefined {
    const unparsed: any | undefined = params[key];
    if (unparsed === undefined) return undefined;
    return parse(unparsed);
}


// these are mostly just here to make sure we use a consistent format for responses
function respondOK<T>(response: ff.Response, result?: T, apiStatus: ApiResponseStatus = 1, httpStatus: number = 200): void {
    response.status(httpStatus).send({ result: result, status: apiStatus });
}


function handleError(response: ff.Response, error: ApiError | Error): void {
    if (error instanceof ApiError) {
        respondError(response, error);

    } else {
        respondError(response, ApiError.generalServerError(error.message));
    }
}


function respondError(response: ff.Response, error: ApiError): void {
    response.status(error.httpStatus).send(error.toApiResponse());
}
