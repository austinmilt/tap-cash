import { BusinessRecipientAddressCreationRequest, CardCreationRequest, PaymentCreationRequest, TransferCreationRequest } from "@circle-fin/circle-sdk";

export const samplePayment:PaymentCreationRequest = {
    idempotencyKey: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
    keyId: 'test',
    metadata: {
        email: 'satoshi@circle.com',
        phoneNumber: '+14155555555',
        sessionId: 'DE6FA86F60BB47B379307F851E238617',
        ipAddress: '244.28.239.130'
    },
    amount: {currency: 'USD', amount: '1.00'},
    verification: "none",
    // verificationSuccessUrl
    // verificationFailureUrl
    source: {/*?? id, type - both optional */ },
    description: 'sample deposit into tap',
    // encryptedData
    // channel
}

export const sampleTransfer: TransferCreationRequest = {
    idempotencyKey: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
    source: {type: 'wallet', id: '1011922176'},
    destination: {type: 'wallet', id: '1011922762'},
    amount: {amount: '5.00', currency: 'USD'},    
}

export const sampleCard: CardCreationRequest = {
    idempotencyKey: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
    encryptedData: '45560123789401460146565', 
    billingDetails:{
        name: 'satoshi',
        city: 'portland',
        country: 'usa',
        line1: '123 anywhere street',
        postalCode: '97215'
    }, 
    expMonth: 12, 
    expYear: 2025, 
    metadata: {
        email: 'satoshi@circle.com',
        phoneNumber: '+14155555555',
        sessionId: 'DE6FA86F60BB47B379307F851E238617',
        ipAddress: '244.28.239.130'
    }
}

const sampleAddressInput: BusinessRecipientAddressCreationRequest = {
    idempotencyKey: 'ba943ff1-ca16-49b2-ba55-1057e70ca5c7',
    address: 'Cxcfw2GC1tfEPEuNABNwTujwr6nEtsV6Enzjxz2pDqoE',
    chain: 'SOL',
    currency: 'USD',
    description: 'user x PDA'
}