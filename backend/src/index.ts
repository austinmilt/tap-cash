import * as ff from '@google-cloud/functions-framework';
import { CircleClient } from './circle/client';

// e.g. http://localhost:8080?name=dave
ff.http('hello-world', (req: ff.Request, res: ff.Response) => {
  const name = req.query.name;
  if (typeof name !== 'string') {
    respondClientError(res, "Missing or invalid required parameter: name");

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
    .catch(error => {
      respondServerError(res, (error as unknown as Error).message);
    })
});


// these are mostly just here to make sure we use a consistent format for responses
function respondOK<T>(response: ff.Response, result: T): void {
  response.status(200).send({result: result});
}


function respondServerError(response: ff.Response, error: string): void {
  response.status(500).send({error: error});
}


function respondClientError(response: ff.Response, error: string): void {
  response.status(400).send({error: error});
}
