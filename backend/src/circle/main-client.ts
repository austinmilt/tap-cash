import {
    Circle,
    PaymentCreationRequest,
    CardCreationRequest,
    Card,
    BusinessRecipientAddressCreationRequest,
    BusinessRecipientAddressObject,
} from "@circle-fin/circle-sdk";
import { ApiError } from "../shared/error";
import { CIRCLE_API_KEY, CIRCLE_ENVIRONMENT } from "../constants";
import { CircleClient, CircleDepositArgs } from "./client";

export class CircleMainClient implements CircleClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleMainClient {
        return new CircleMainClient(new Circle(CIRCLE_API_KEY, CIRCLE_ENVIRONMENT));
    }

    /**
     *
     * @param paymentDetail PaymentCreationRequest
     * @returns a payment ID as a string
     */
    private async createAndSendPayment(paymentDetail: PaymentCreationRequest): Promise<string | undefined> {
        let payementResponse = await this.sdk.payments.createPayment(paymentDetail);
        return payementResponse.data.data?.id;
    }

    /**
     * Add a new Credit Card
     * @param cardDetail
     * @returns unique Id of card
     */
    private async addCreditCard(cardDetail: CardCreationRequest): Promise<string | undefined> {
        let cardResponse = await this.sdk.cards.createCard(cardDetail);
        return cardResponse.data.data?.id;
    }


    public async fetchCard(id: string): Promise<Card> {
        const response = await this.sdk.cards.getCard(id);
        const card: Card | undefined = response.data.data;
        if (card === undefined) {
            throw ApiError.noCardFound();
        }
        return card;
    }


    public async transferUsdc(args: CircleDepositArgs): Promise<void> {
        try {
            let transfer = await this.sdk.transfers.createTransfer();
            return;
        }
        catch {
            ApiError.generalServerError("Failed to transfer funds.");
        }

    }

    private async createDestinationAddress(destination: BusinessRecipientAddressCreationRequest): Promise<BusinessRecipientAddressObject | undefined> {
        let response = await this.sdk.addresses.createBusinessRecipientAddress();
        return response.data.data;
    }

}
