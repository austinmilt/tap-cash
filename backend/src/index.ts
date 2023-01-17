import * as ff from '@google-cloud/functions-framework';
import { CircleClient } from './circle/client';

ff.http('hello-world', (req: ff.Request, res: ff.Response) => {
  res.send({result: "hello, world"});
});

ff.http('list-channels', (req: ff.Request, res: ff.Response) => {
  const circleClient: CircleClient = CircleClient.ofDefaults();
  circleClient.listChannels()
    .then((result) => {
      res.status(200).send({result: result});
    })
    .catch(error => {
      res.status(500).send({error: (error as unknown as Error).message});
    })
});
