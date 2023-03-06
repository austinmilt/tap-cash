import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiSaveMemberRequest, ApiRecentActivityRequest, ApiRecentActivityResult } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleSaveMember } from "./save-member";
import { buildGetRequest, buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { Keypair, PublicKey } from "../helpers/solana";
import { handleRecentActivity } from "./recent-activity";


describe('recent-activity handler', () => {
    it('recent-activity - member has no activity - returns empty', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        await handleSaveMember(
            buildPostRequest<ApiSaveMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: Keypair.generate().publicKey.toBase58()
            }),
            new MockHttpResponse
        );

        await handleRecentActivity(
            buildGetRequest<ApiRecentActivityRequest>({
                memberEmail: "mary.jane@gmail.com",
                limit: "10"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(mockResponse.mockedNextUse()?.json?.body.result).toStrictEqual([]);
    });


    it('recent-activity - member has more activity than limit - returns most recent', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        // initialize sender and recipient
        const userWallet: Keypair = Keypair.generate();
        await handleSaveMember(
            buildPostRequest<ApiSaveMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: userWallet.publicKey.toBase58()
            }),
            new MockHttpResponse()
        );

        tapClient.setMemberBalance(userWallet.publicKey, 9999999);

        const recipientId: PublicKey = Keypair.generate().publicKey;
        await handleSaveMember(
            buildPostRequest<ApiSaveMemberRequest>({
                emailAddress: "john.doe@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "John Doe",
                signerAddressBase58: recipientId.toBase58()
            }),
            new MockHttpResponse()
        );

        // "send" money
        for (let i = 0; i < 20; i++) {
            tapClient.sendTokens({
                fromMember: userWallet,
                destinationAta: tapClient.getMemberAta(recipientId),
                amount: 1
            });
        }

        // get recent activity
        await handleRecentActivity(
            buildGetRequest<ApiRecentActivityRequest>({
                memberEmail: "mary.jane@gmail.com",
                limit: "10"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        const result: ApiRecentActivityResult = mockResponse.mockedNextUse()?.json?.body.result;
        expect(result.length).toStrictEqual(10);
        result.forEach(act => expect(act.send?.recipient.email).toStrictEqual("john.doe@gmail.com"));
        result.forEach(act => expect(act.send?.amount).toStrictEqual(1));
    });


    it('recent-activity - non-member - errors', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);
        await handleRecentActivity(
            buildGetRequest<ApiRecentActivityRequest>({
                memberEmail: "mary.jane@gmail.com",
                limit: "10"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(400);
    });
});
