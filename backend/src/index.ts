import * as ff from '@google-cloud/functions-framework';
import { CircleClient } from './circle/client';

// e.g. http://localhost:8080?name=dave
ff.http('hello-world', (req: ff.Request, res: ff.Response) => {
  const name = req.query.name;
  if (typeof name !== 'string') {
    res.status(400).send({error: "Missing or invalid required parameter: name"})

  } else {
    res.send({result: `hello, ${req.query.name}`});
  }
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
