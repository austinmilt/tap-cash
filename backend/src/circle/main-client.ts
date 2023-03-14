import {
    Circle,
    CardCreationRequest,
    Card,
    PaymentCreationRequestVerificationEnum,
    PublicKey,
} from "@circle-fin/circle-sdk";
import { ApiError } from "../shared/error";
import { CIRCLE_API_KEY, CIRCLE_ENVIRONMENT, CIRCLE_MASTER_WALLET, SERVER_ENV } from "../constants";
import { CircleClient, CircleDepositArgs } from "./client";
import { v4 as uuid } from "uuid";
import { pgpEncrypt } from "./open-pgp";
import { CircleCardId, ServerEnv } from "../types/types";

export class CircleMainClient implements CircleClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleMainClient {
        return new CircleMainClient(new Circle(CIRCLE_API_KEY, CIRCLE_ENVIRONMENT));
    }


    private async addRandomCard(): Promise<CircleCardId> {
        if (SERVER_ENV === ServerEnv.PROD) {
            throw new Error("Only allowed in dev environments.");
        }
        return await this.addCreditCard(exampleCards[Math.floor(Math.random() * exampleCards.length)]);
    }


    // https://github.com/circlefin/payments-sample-app/blob/78e3d1b5b3b548775e755f1b619720bcbe5a8789/pages/flow/charge/index.vue
    private async addCreditCard(args: CardDetails): Promise<CircleCardId> {
        const publicKey: PublicKey = await this.getCircleRsaKey();
        const verificationDetails: CardVerificationDetails = {
            number: args.cardNumber,
            cvv: args.cvv
        };
        const encryptedData = await pgpEncrypt(verificationDetails, publicKey);
        const { encryptedMessage, keyId } = encryptedData;
        const payload: CardCreationRequest = {
            idempotencyKey: uuid(),
            expMonth: parseInt(args.expiry.month),
            expYear: parseInt(args.expiry.year),
            keyId: keyId,
            encryptedData: encryptedMessage,
            billingDetails: {
                name: args.name,
                city: args.city,
                country: args.country,
                line1: args.line1,
                line2: args.line2,
                postalCode: args.postalCode,
                district: args.district
            },
            metadata: {
                email: args.email,
                phoneNumber: args.phoneNumber,
                //TODO copied from example
                sessionId: 'xxx',
                ipAddress: '172.33.222.1',
            },
        }
        let cardResponse = await this.sdk.cards.createCard(payload);
        const cardId: string | undefined = cardResponse.data.data?.id;
        if (cardId === undefined) {
            //TODO better error
            throw ApiError.generalServerError(`Couldnt make card: status: ${cardResponse.statusText}, code: ${cardResponse.data.data?.errorCode}`);
        }
        return cardId;
    }


    public async fetchCard(id: string): Promise<Card> {
        const response = await this.sdk.cards.getCard(id);
        const card: Card | undefined = response.data.data;
        if (card === undefined) {
            throw ApiError.noCardFound();
        }
        return card;
    }


    public async depositUsdc(args: CircleDepositArgs): Promise<void> {
        //TODO replace when going to prod
        const cardId: string = await this.addRandomCard();
        const cardCvv: string = "123"; // all the example cards have this cvv

        // https://developers.circle.com/developer/reference/createpayment
        const publicKey: PublicKey = await this.getCircleRsaKey();
        const verificationDetails: Partial<CardVerificationDetails> = {
            cvv: cardCvv
        };
        const encryptedData = await pgpEncrypt(verificationDetails, publicKey);
        const { encryptedMessage, keyId } = encryptedData;

        const transactionId: string = uuid();
        const paymentResponse = await this.sdk.payments.createPayment({
            idempotencyKey: transactionId,
            amount: {
                amount: args.amount.toFixed(2),
                currency: "USD"
            },
            verification: PaymentCreationRequestVerificationEnum.Cvv,
            metadata: {
                email: args.member,
                sessionId: 'xxx',
                ipAddress: '172.33.222.1'
            },
            source: {
                id: cardId,
                type: "card",
            },
            description: "Deposit to Tap account.",
            encryptedData: encryptedMessage,
            keyId: keyId
        });

        if (paymentResponse.status < 400) {
            try {
                const transferResponse = await this.sdk.transfers.createTransfer({
                    idempotencyKey: uuid(),
                    source: {
                        type: "wallet",
                        id: CIRCLE_MASTER_WALLET
                    },
                    destination: {
                        chain: "SOL",
                        address: args.destinationAtaString,
                        type: "blockchain",
                    },
                    amount: {
                        amount: `${args.amount}`,
                        currency: "USD"
                    }
                });

                if (transferResponse.status >= 400) {
                    throw ApiError.generalServerError("Unable to transfer funds to user.");
                }
            } catch (e) {
                throw ApiError.generalServerError("Unable to transfer funds to user.");
            }
        }
    }


    private async getCircleRsaKey(): Promise<PublicKey> {
        const publicKey = (await this.sdk.encryption.getPublicKey()).data.data;
        if (publicKey === undefined) {
            throw ApiError.generalServerError("Unable to get Circle credentials.");
        }
        return publicKey;
    }
}


// https://github.com/circlefin/payments-sample-app/blob/78e3d1b5b3b548775e755f1b619720bcbe5a8789/lib/cardsApi.ts
interface MetaData {
    email?: string;
    phoneNumber?: string;
    sessionId: string;
    ipAddress: string;
}


interface CardVerificationDetails {
    /**
     * numbers only
     */
    number: string;
    cvv: string;
}


interface CardDetails {
    cardNumber: string;
    cvv: string;
    expiry: {
        month: string;
        year: string;
    },
    name: string;
    country: string;
    district?: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
}

// https://github.com/circlefin/payments-sample-app/blob/78e3d1b5b3b548775e755f1b619720bcbe5a8789/lib/cardTestData.ts
const exampleCards: CardDetails[] = [
    {
        cardNumber: '4007400000000007',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0001',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0001@circle.com'
    },
    {
        cardNumber: '4007410000000006',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0002',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0002@circle.com',
    },
    {
        cardNumber: '4200000000000000',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0003',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0003@circle.com',
    },
    {
        cardNumber: '4757140000000001',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0004',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0004@circle.com',
    },
    {
        cardNumber: '5102420000000006',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0005',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0005@circle.com',
    },
    {
        cardNumber: '5173375000000006',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0006',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0006@circle.com',
    },
    {
        cardNumber: '5555555555554444',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0007',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0007@circle.com',
    },
    {
        cardNumber: '378282246310005',
        cvv: '123',
        expiry: {
            month: '01',
            year: '2025',
        },
        name: 'Customer 0009',
        country: 'US',
        district: 'MA',
        line1: 'Test',
        line2: '',
        city: 'Test City',
        postalCode: '11111',
        phoneNumber: '+12025550180',
        email: 'customer-0009@circle.com',
    },
];
