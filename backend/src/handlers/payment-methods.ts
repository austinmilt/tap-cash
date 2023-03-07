
import { Card, CardNetworkEnum } from "@circle-fin/circle-sdk";
import { EmailAddress } from "../shared/member";
import { CreditCardCarrier, PaymentMethodSummary, PaymentMethodType } from "../shared/payment";
import { CircleCardId } from "../types/types";
import { ApiSavedPaymentMethodsRequest, ApiSavedPaymentMethodsResult } from "../shared/api";
import { getRequiredParam, makeGetHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";

interface PaymentMethodArgs {
    memberEmail: EmailAddress;
}

//TODO this needs to have authentication
export const handlePaymentMethods = makeGetHandler(getPaymentMethods, transformRequest, transformResult);

async function getPaymentMethods(request: PaymentMethodArgs): Promise<PaymentMethodSummary[]> {
    const circleCardIds: Set<CircleCardId> = await getDatabaseClient().getCircleCreditCards(request.memberEmail);
    const cards: Card[] = await Promise.all(Array.from(circleCardIds).map(id => getCircleClient().fetchCard(id)));
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
