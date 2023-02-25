// Google Cloud Functions Framework main entrypoint

import * as ff from '@google-cloud/functions-framework';
import { CircleClient } from './circle/client';
import { ApiError } from '../../shared/error';
import { InitializeMemberArgs, initializeMember } from './handlers/new-member';
import { Arg } from '../../shared/arg';
import * as anchor from "@project-serum/anchor";
import { ApiResponseStatus } from '../../shared/api';
import { DepositArgs, deposit } from './handlers/deposit';

// e.g. http://localhost:8080?name=dave
ff.http('hello-world', (req: ff.Request, res: ff.Response) => {
  const name = req.query.name;
  if (typeof name !== 'string') {
    respondError(res, ApiError.generalClientError("Missing or invalid required parameter: name"));

  } else {
    respondOK(res, `hello, ${req.query.name}`);
  }
});


ff.http('list-channels', (req: ff.Request, res: ff.Response) => {
  const circleClient: CircleClient = CircleClient.ofDefaults();
  circleClient.listChannels()
    .then((result) => {
      respondOK(res, result);
    })
    .catch(e => handleError(res, e))
});


ff.http('new-member', (req: ff.Request, res: ff.Response) => {
  initializeMember(transformInitializeMemberRequest(req))
    .then(() => {
      // no need to send the member ID back to the client
      respondOK(res);
    })
    .catch(e => handleError(res, e))
});


function transformInitializeMemberRequest(req: ff.Request): InitializeMemberArgs {
  Arg.notNullish(req.body, "req.body");
  return {
    emailAddress: getRequiredParam(req.body, "emailAddress"),
    walletAddress: getPublicKeyParam(req.body, "walletAddressBase58")
  };
}


ff.http('deposit', (req: ff.Request, res: ff.Response) => {
  deposit(transformDepositRequest(req))
    .then(() => {
      respondOK(res);
    })
    .catch(e => handleError(res, e))
});


function transformDepositRequest(req: ff.Request): DepositArgs {
  Arg.notNullish(req.body, "req.body");
  return {
    emailAddress: getRequiredParam(req.body, "emailAddress"),
    currency: getRequiredParam(req.body, "currency"),
    amount: getRequiredParam(req.body, "amount", Number.parseFloat)
  };
}


function getPublicKeyParam(
  body: ff.Request['body'],
  key: string,
): anchor.web3.PublicKey {
  return getRequiredParam(body, key, parsePublicKey);
}


function parsePublicKey(base58PublicKey: string): anchor.web3.PublicKey {
  return new anchor.web3.PublicKey(base58PublicKey);
}


function getRequiredParam<T>(
  body: ff.Request['body'],
  key: string,
  parse?: (value: any) => T
): T {
  const candidate: T | undefined = getParam(body, key, parse);
  if (candidate === undefined) {
    throw ApiError.missingParameter(key);
  }
  return candidate;
}


function getOptionalParam<T>(
  body: ff.Request['body'],
  key: string,
  fallbackValue?: T,
  parse?: (value: any) => T
): T | undefined {
  const candidate: T | undefined = getParam(body, key, parse);
  if (candidate === undefined) {
    return fallbackValue;
  }
  return candidate;
}


function getParam<T>(
  body: any,
  key: string,
  parse: (value: any) => T = value => value as T
): T | undefined {
  const unparsed: any | undefined = body[key];
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
