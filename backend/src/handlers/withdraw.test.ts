import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiInitializeMemberRequest, ApiSendRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleNewMember } from "./new-member";
import { buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { Keypair, PublicKey } from "../helpers/solana";
import { handleSend } from "./send";


describe('withdraw handler', () => {
    it.skip('send - all good - user account is debited', async () => {
        //TODO
    });
});
