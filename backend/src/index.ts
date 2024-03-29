// Google Cloud Functions Framework main entrypoint

import * as ff from '@google-cloud/functions-framework';
import { handleSaveMember } from './handlers/save-member';
import { handleDeposit } from './handlers/deposit';
import { handleSend } from './handlers/send';
import { handleWithdraw } from './handlers/withdraw';
import { handleQueryRecipients } from './handlers/query-recipients';
import { handleRecentActivity } from './handlers/recent-activity';
import { handlePaymentMethods } from './handlers/payment-methods';
import { SERVER_ENV } from './constants';
import { ServerEnv } from './types/types';
import { handleAccount } from './handlers/account';

// local endpoints
ff.http('index', (req: ff.Request, res: ff.Response) => {
  if (SERVER_ENV !== ServerEnv.LOCAL) {
    throw new Error(
      "Only permitted in local development environment. " +
      "Individual functions must be deployed to Google Cloud."
    );
  }
  if (req.path.startsWith("/query-recipients")) handleQueryRecipients(req, res);
  else if (req.path.startsWith("/deposit")) handleDeposit(req, res);
  else if (req.path.startsWith("/save-member")) handleSaveMember(req, res);
  else if (req.path.startsWith("/send")) handleSend(req, res);
  else if (req.path.startsWith("/withdraw")) handleWithdraw(req, res);
  else if (req.path.startsWith("/payment-methods")) handlePaymentMethods(req, res);
  else if (req.path.startsWith("/recent-activity")) handleRecentActivity(req, res);
  else if (req.path.startsWith("/account")) handleAccount(req, res);
  else res.sendStatus(400);
});


// deployed endpoints
ff.http('deposit', handleDeposit);
ff.http('save-member', handleSaveMember);
ff.http('send', handleSend);
ff.http('withdraw', handleWithdraw);
ff.http('payment-methods', handlePaymentMethods);
ff.http('query-recipients', handleQueryRecipients);
ff.http('recent-activity', handleRecentActivity);
ff.http('account', handleAccount);
