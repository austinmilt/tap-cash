import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiAccountRequest, ApiAccountResult, ApiSaveMemberRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { handleSaveMember } from "./save-member";
import { buildGetRequest, buildPostRequest } from "../dev/testing/utils";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { Keypair } from "../helpers/solana";
import { handleAccount } from "./account";


describe('account handler', () => {
    it('account - all good - member account is returned', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);

        const tapClient: MockTapCashClient = MockTapCashClient.make();
        setTapCashClient(tapClient);

        // initialize member
        const userWallet: Keypair = Keypair.generate();
        const profile = {
            emailAddress: "mary.jane@gmail.com",
            profilePictureUrl: "https://www.google.com",
            name: "Mary Jane",
            signerAddressBase58: userWallet.publicKey.toBase58()
        }
        await handleSaveMember(
            buildPostRequest<ApiSaveMemberRequest>(profile),
            new MockHttpResponse()
        );

        await handleAccount(
            buildGetRequest<ApiAccountRequest>({
                memberEmail: "mary.jane@gmail.com"
            }),
            mockResponse
        )

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        const result: ApiAccountResult = mockResponse.mockedLastUse()?.json?.body.result;
        expect(result.email).toStrictEqual(profile.emailAddress);
        expect(result.name).toStrictEqual(profile.name);
        expect(result.profile).toStrictEqual(profile.profilePictureUrl);
        expect(result.signerAddress).toStrictEqual(profile.signerAddressBase58);
        expect(result.usdcAddress).not.toBeNull();
    });
});
