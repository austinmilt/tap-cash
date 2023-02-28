
//TODO tests

import { Card, CardNetworkEnum } from "@circle-fin/circle-sdk";
import { CircleEmulator } from "../circle/circle-emulator";
import { CircleClient } from "../circle/client";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { EmailAddress } from "../shared/member";
import { CreditCardCarrier, PaymentMethodSummary, PaymentMethodType } from "../shared/payment";
import { CircleCardId } from "../types/types";
import { ApiSavedPaymentMethodsRequest, ApiSavedPaymentMethodsResult } from "../shared/api";
import { getRequiredParam, makeGetHandler } from "./model";

interface PaymentMethodArgs {
    memberEmail: EmailAddress;
}

export const handlePaymentMethods = makeGetHandler(getPaymentMethods, transformRequest, transformResult);

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const CIRCLE_CLIENT: CircleClient = CircleEmulator.ofDefaults();

async function getPaymentMethods(request: PaymentMethodArgs): Promise<PaymentMethodSummary[]> {
    const circleCardIds: Set<CircleCardId> = await DB_CLIENT.getCircleCreditCards(request.memberEmail);
    const cards: Card[] = await Promise.all(Array.from(circleCardIds).map(CIRCLE_CLIENT.fetchCard));
    return cards.map(card => ({
        type: PaymentMethodType.CREDIT_CARD,
        creditCard: {
            carrier: circleNetworkToCarrier(card.network),
            holderName: card.billingDetails.name,
            lastFourDigits: Number.parseInt(card.last4),
            expiration: `${card.expMonth}/${card.expYear}`
        }
    }));
}


function circleNetworkToCarrier(network: CardNetworkEnum): CreditCardCarrier {
    switch (network) {
        case "AMEX": return CreditCardCarrier.AMERICAN_EXPRESS;
        case "MASTERCARD": return CreditCardCarrier.MASTERCARD;
        case "VISA": return CreditCardCarrier.VISA;
        default: return CreditCardCarrier.UNKNOWN;
    }
}


function transformRequest(params: ApiSavedPaymentMethodsRequest): PaymentMethodArgs {
    return {
        memberEmail: getRequiredParam<ApiSavedPaymentMethodsRequest, EmailAddress>(params, "memberEmail"),
    };
}


function transformResult(result: PaymentMethodSummary[]): ApiSavedPaymentMethodsResult {
    return result;
}
