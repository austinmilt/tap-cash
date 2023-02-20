import { PaymentCreationRequest } from "@circle-fin/circle-sdk";

export const samplePayment:PaymentCreationRequest = {
    idempotencyKey: 'test',
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