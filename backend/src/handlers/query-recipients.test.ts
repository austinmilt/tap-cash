import * as ff from "@google-cloud/functions-framework";
import { handleQueryRecipients } from "./query-recipients";
import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiQueryRecipientsRequest, ApiQueryRecipientsResult } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient } from "../helpers/singletons";
import { Keypair } from "../helpers/solana";
import { buildGetRequest } from "../dev/testing/utils";


describe('query-recipients handler', () => {
    it('query-recipients - no match - returns empty result', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);
        await handleQueryRecipients(
            buildGetRequest<ApiQueryRecipientsRequest>({
                emailQuery: "ma",
                limit: "10"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(mockResponse.mockedNextUse()?.send?.body.result).toStrictEqual([]);
    });


    it('query-recipients - single match - returns result', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        //TODO would be better to mock the firebase code in FirestoreClient
        // so you can e2e test the client as well.
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        await dbClient.addMember(
            {
                email: "mary.jane@gmail.com",
                name: "Mary Jane",
                profile: "https://google.com"
            },
            Keypair.generate().publicKey,
            Keypair.generate().publicKey
        );

        await handleQueryRecipients(
            buildGetRequest<ApiQueryRecipientsRequest>({
                emailQuery: "ma",
                limit: "10"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        const result: ApiQueryRecipientsResult = mockResponse.mockedNextUse()?.send?.body.result;
        expect(result.length).toStrictEqual(1);
        expect(result[0].emailAddress).toStrictEqual("mary.jane@gmail.com");
    });
});
