import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiDepositRequest, ApiInitializeMemberRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleNewMember } from "./new-member";
import { buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { Keypair } from "../helpers/solana";
import { handleDeposit } from "./deposit";


describe('deposit handler', () => {
    it('deposit - all good - account is credited', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        // initialize member
        const userWallet: Keypair = Keypair.generate();
        await handleNewMember(
            buildPostRequest<ApiInitializeMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://www.google.com",
                name: "Mary Jane",
                signerAddressBase58: userWallet.publicKey.toBase58()
            }),
            new MockHttpResponse()
        );

        await handleDeposit(
            buildPostRequest<ApiDepositRequest>({
                emailAddress: "mary.jane@gmail.com",
                amount: 100
            }),
            mockResponse
        )

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        expect(tapClient.getMemberAccount(userWallet.publicKey)?.balance).toStrictEqual(100);
    });
});
