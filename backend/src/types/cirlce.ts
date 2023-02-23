// Object to be encrypted
export interface CardDetails {
    number?: string,    // required when storing card details
    cvv?: string        // required when cardVerification is set to cvv
}

// Encrypted result
export interface EncryptedValue {
    encryptedData: string,
    keyId: string
}