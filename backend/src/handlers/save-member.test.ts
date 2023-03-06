import { MockHttpResponse, UsedMethod } from "../dev/testing/MockHttpResponse";
import { ApiInitializeMemberRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleSaveMember } from "./save-member";
import { buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { PublicKey } from "../helpers/solana";


describe('new-member handler', () => {
    it('new-member - all good - new member added to (mocked) db', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);
        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: "rand4XuRxdtPS9gDYy6KDeGkEpi69xmkCy5oEmDYfoC"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect((await dbClient.queryMembersByEmail("mary.jane@gmail.com", 1))[0].name).toStrictEqual("Mary Jane");
    });


    it('new-member - all good - new member account initialized on (mock) chain', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();

        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        const userId: PublicKey = new PublicKey("rand4XuRxdtPS9gDYy6KDeGkEpi69xmkCy5oEmDYfoC");

        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: userId.toBase58()
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(tapClient.getMemberAccount(userId)?.balance).toStrictEqual(0);
    });

    it('new-member - member already exists - updates member data', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: "rand4XuRxdtPS9gDYy6KDeGkEpi69xmkCy5oEmDYfoC"
            }),
            new MockHttpResponse()
        );

        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Doe",
                signerAddressBase58: "rand4XuRxdtPS9gDYy6KDeGkEpi69xmkCy5oEmDYfoC"
            }),
            mockResponse
        );

        expect(mockResponse.mockedLastUseOf(UsedMethod.STATUS)?.status?.code).toStrictEqual(200);
        expect((await dbClient.queryMembersByEmail("mary.jane@gmail.com", 1))[0].name).toStrictEqual("Mary Doe");
    });
});
