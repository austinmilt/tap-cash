
import { Card, CardNetworkEnum, CvvResults } from "@circle-fin/circle-sdk";
import { EmailAddress } from "../shared/member";
import { CreditCardCarrier, PaymentMethodSummary, PaymentMethodType } from "../shared/payment";
import { CircleCardId } from "../types/types";
import { ApiSavedPaymentMethodsRequest, ApiSavedPaymentMethodsResult } from "../shared/api";
import { getRequiredParam, makeGetHandler } from "./model";
import { getCircleClient, getDatabaseClient } from "../helpers/singletons";
import { USE_DUMMY_CARD } from "../constants";

/**
 * Arguments for the getPaymentMethods handler.
 */
interface PaymentMethodArgs {
    /* Member email address */
    memberEmail: EmailAddress;
}

//TODO this needs to have authentication
export const handlePaymentMethods = makeGetHandler(getPaymentMethods, transformRequest, transformResult);

/**
 * 
 * Fetch a member's saved payment methods from the Database Client
 * (uses DUMMY_CARD if USE_DUMMY_CARD is true in .env)
 * @param request PaymentMethodArgs - the request arguments
 * @returns PaymentMethodSummary[] - the result of the getPaymentMethods handler
 */
async function getPaymentMethods(request: PaymentMethodArgs): Promise<PaymentMethodSummary[]> {
    let cards: Card[];
    if (USE_DUMMY_CARD) cards = [DUMMY_CARD];
    else {
        const circleCardIds: Set<CircleCardId> = await getDatabaseClient().getCircleCreditCards(request.memberEmail);
        cards = await Promise.all(Array.from(circleCardIds).map(id => getCircleClient().fetchCard(id)));
    }

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

/**
 * 
 * Fetch the Network Carier of a Circle Card
 * 
 * @param network CardNetworkEnum - the network of the card
 * @returns CreditCardCarrier - the carrier of the card
 */
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


const DUMMY_CARD: Card = {
    id: "baronsupercard",
    status: "pending",
    billingDetails: {
        name: "Baron Bilano",
        city: "Baronville",
        country: "Baronia",
        line1: "123 Baron Street",
        postalCode: "12345"
    },
    expMonth: 1,
    expYear: 2025,
    network: "VISA",
    last4: "4321",
    fingerprint: "alskjdflajksdflj",
    verification: {
        avs: "laksjlkasjdf",
        cvv: CvvResults.Pass
    },
    metadata: {
        email: "baron.bilano@gmail.com"
    },
    createDate: "21:30:38Z",
    updateDate: "21:30:38Z"
}
