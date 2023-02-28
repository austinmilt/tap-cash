export interface PaymentMethodSummary {
    type: PaymentMethodType;
    creditCard?: CreditCardSummary;
}


export enum PaymentMethodType {
    CREDIT_CARD
}


export interface CreditCardSummary {
    carrier: CreditCardCarrier;
    lastFourDigits: number;
    holderName: string;
    expiration: string;
}


export enum CreditCardCarrier {
    AMERICAN_EXPRESS,
    MASTERCARD,
    DISCOVER,
    VISA,
    UNKNOWN
}
