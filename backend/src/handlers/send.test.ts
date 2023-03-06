import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiInitializeMemberRequest, ApiSendRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleSaveMember } from "./save-member";
import { buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { Keypair, PublicKey } from "../helpers/solana";
import { handleSend } from "./send";


describe('send handler', () => {
    it('send - all good - sender is debited', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        // initialize sender and recipient
        const userWallet: Keypair = Keypair.generate();
        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: userWallet.publicKey.toBase58()
            }),
            new MockHttpResponse()
        );

        tapClient.setMemberBalance(userWallet.publicKey, 10);

        const recipientId: PublicKey = Keypair.generate().publicKey;
        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "john.doe@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "John Doe",
                signerAddressBase58: recipientId.toBase58()
            }),
            new MockHttpResponse()
        );

        await handleSend(
            buildPostRequest<ApiSendRequest>({
                senderEmailAddress: "mary.jane@gmail.com",
                recipientEmailAddress: "john.doe@gmail.com",
                amount: 9,
                privateKey: Array.from(userWallet.secretKey)
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(tapClient.getMemberAccount(userWallet.publicKey)?.balance).toStrictEqual(1);
    });


    it('send - all good - recipient is credited', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        // initialize sender and recipient
        const userWallet: Keypair = Keypair.generate();
        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: userWallet.publicKey.toBase58()
            }),
            new MockHttpResponse()
        );

        tapClient.setMemberBalance(userWallet.publicKey, 10);

        const recipientId: PublicKey = Keypair.generate().publicKey;
        await handleSaveMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "john.doe@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "John Doe",
                signerAddressBase58: recipientId.toBase58()
            }),
            new MockHttpResponse()
        );

        await handleSend(
            buildPostRequest<ApiSendRequest>({
                senderEmailAddress: "mary.jane@gmail.com",
                recipientEmailAddress: "john.doe@gmail.com",
                amount: 9,
                privateKey: Array.from(userWallet.secretKey)
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(tapClient.getMemberAccount(recipientId)?.balance).toStrictEqual(9);
    });
});
