// Google Cloud Functions Framework main entrypoint

import * as ff from '@google-cloud/functions-framework';
import { CircleClient } from './circle/client';
import { ApiError } from '../../shared/error';
import { InitializeMemberArgs, initializeMember } from './handlers/new-member';
import { Arg } from '../../shared/arg';
import * as anchor from "@project-serum/anchor";
import { ApiDepositRequest, ApiInitializeMemberRequest, ApiQueryRecipientsRequest, ApiResponseStatus, ApiSendRequest, ApiWithdrawRequest } from '../../shared/api';
import { DepositArgs, deposit } from './handlers/deposit';
import { send, SendArgs } from './handlers/send';
import { AccountId, EmailAddress } from '../../shared/member';
import { WithdrawArgs, withdraw } from './handlers/withdraw';
import { QueryRecipientsArgs, queryRecipients } from './handlers/query-recipients';

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
    emailAddress: getRequiredParam<ApiInitializeMemberRequest, EmailAddress>(req.body, "emailAddress"),
    walletAddress: getPublicKeyParam<ApiInitializeMemberRequest>(req.body, "walletAddressBase58")
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
    emailAddress: getRequiredParam<ApiDepositRequest, EmailAddress>(req.body, "emailAddress"),
    destinationAccountId: getRequiredParam<ApiDepositRequest, AccountId>(req.body, "destinationAccountId"),
    amount: getRequiredParam<ApiDepositRequest, number>(req.body, "amount", Number.parseFloat)
  };
}


ff.http('send', (req: ff.Request, res: ff.Response) => {
  send(transformSendRequest(req))
    .then(() => {
      respondOK(res);
    })
    .catch(e => handleError(res, e))
});


function transformSendRequest(req: ff.Request): SendArgs {
  Arg.notNullish(req.body, "req.body");
  return {
    senderEmailAddress: getRequiredParam<ApiSendRequest, EmailAddress>(req.body, "senderEmailAddress"),
    recipientEmailAddress: getRequiredParam<ApiSendRequest, EmailAddress>(req.body, "recipientEmailAddress"),
    senderAccountId: getRequiredParam<ApiSendRequest, AccountId>(req.body, "senderAccountId"),
    amount: getRequiredParam<ApiSendRequest, number>(req.body, "amount", Number.parseFloat)
  };
}


ff.http('withdraw', (req: ff.Request, res: ff.Response) => {
  withdraw(transformWithdrawRequest(req))
    .then(() => {
      respondOK(res);
    })
    .catch(e => handleError(res, e))
});


function transformWithdrawRequest(req: ff.Request): WithdrawArgs {
  Arg.notNullish(req.body, "req.body");
  return {
    emailAddress: getRequiredParam<ApiWithdrawRequest, EmailAddress>(req.body, "emailAddress"),
    sourceAccount: getRequiredParam<ApiWithdrawRequest, AccountId>(req.body, "sourceAccount"),
    amount: getRequiredParam<ApiWithdrawRequest, number>(req.body, "amount", Number.parseFloat)
  };
}


ff.http('query-recipients', (req: ff.Request, res: ff.Response) => {
  queryRecipients(transformQueryRecipientsRequest(req))
    .then(() => {
      respondOK(res);
    })
    .catch(e => handleError(res, e))
});


function transformQueryRecipientsRequest(req: ff.Request): QueryRecipientsArgs {
  Arg.notNullish(req.body, "req.body");
  return {
    emailQuery: getRequiredParam<ApiQueryRecipientsRequest, string>(req.body, "emailQuery"),
    limit: getRequiredIntegerParam<ApiQueryRecipientsRequest>(req.body, "limit"),
  };
}


function getRequiredIntegerParam<R>(body: ff.Request['body'], key: keyof R): number {
  return getRequiredParam<R, number>(body, key, Number.parseInt);
}


function getPublicKeyParam<R>(body: ff.Request['body'], key: keyof R): anchor.web3.PublicKey {
  return getRequiredParam<R, anchor.web3.PublicKey>(body, key, v => new anchor.web3.PublicKey(v));
}


function getRequiredParam<R, T>(
  body: ff.Request['body'],
  key: keyof R,
  parse?: (value: any) => T
): T {
  const candidate: T | undefined = getParam<R, T>(body, key, parse);
  if (candidate === undefined) {
    throw ApiError.missingParameter(key as string);
  }
  return candidate;
}


function getOptionalParam<R, T>(
  body: ff.Request['body'],
  key: keyof R,
  fallbackValue?: T,
  parse?: (value: any) => T
): T | undefined {
  const candidate: T | undefined = getParam<R, T>(body, key, parse);
  if (candidate === undefined) {
    return fallbackValue;
  }
  return candidate;
}


function getParam<R, T>(
  body: any,
  key: keyof R,
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
