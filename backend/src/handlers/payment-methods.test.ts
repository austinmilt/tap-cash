import { MockHttpResponse } from "../dev/testing/MockHttpResponse";
import { ApiSaveMemberRequest, ApiSavedPaymentMethodsRequest } from "../shared/api";
import { DatabaseClient } from "../db/client";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { setCircleClient, setDatabaseClient, setTapCashClient } from "../helpers/singletons";
import { Keypair } from "../helpers/solana";
import { buildGetRequest, buildPostRequest } from "../dev/testing/utils";
import { handlePaymentMethods } from "./payment-methods";
import { MockCircleClient } from "../dev/testing/MockCircleClient";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { handleSaveMember } from "./save-member";
import { generateCircleCard } from "../dev/testing/generate";
import { PaymentMethodSummary } from "../shared/payment";


describe('payment-methods handler', () => {
    it('payment-methods - non-member - returns error', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        setDatabaseClient(dbClient);
        await handlePaymentMethods(
            buildGetRequest<ApiSavedPaymentMethodsRequest>({
                memberEmail: "mary.jane@gmail.com"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(400);
    });


    it('query-recipients - all good - returns saved cards', async () => {
        const mockResponse: MockHttpResponse = new MockHttpResponse();
        const dbClient: DatabaseClient = InMemoryDatabaseClient.make();
        const tapClient: MockTapCashClient = MockTapCashClient.make();
        const circleClient: MockCircleClient = MockCircleClient.make(tapClient);
        setDatabaseClient(dbClient);
        setTapCashClient(tapClient);
        setCircleClient(circleClient);

        await handleSaveMember(
            buildPostRequest<ApiSaveMemberRequest>({
                emailAddress: "mary.jane@gmail.com",
                profilePictureUrl: "https://google.com",
                name: "Mary Jane",
                signerAddressBase58: Keypair.generate().publicKey.toBase58()
            }),
            new MockHttpResponse()
        );

        const card = generateCircleCard();
        circleClient.addCard(card);
        dbClient.saveCircleCreditCard("mary.jane@gmail.com", card.id);

        await handlePaymentMethods(
            buildGetRequest<ApiSavedPaymentMethodsRequest>({
                memberEmail: "mary.jane@gmail.com"
            }),
            mockResponse
        );

        expect(mockResponse.mockedNextUse()?.status?.code).toStrictEqual(200);
        const cards: PaymentMethodSummary[] = mockResponse.mockedLastUse()?.json?.body.result;
        expect(cards.length).toStrictEqual(1);
        expect(cards[0].creditCard?.lastFourDigits).toStrictEqual(Number.parseInt(card.last4));
    });
});
