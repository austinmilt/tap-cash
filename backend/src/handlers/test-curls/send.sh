curl -X POST -H "Content-Type: application/json" -d '{
    "emailAddress": "amilz@123.com",
    "profilePictureUrl": "https://test.net/1.png",
    "name": "tino",
    "signerAddressBase58": "Cxcfw2GC1tfEPEuNABNwTujwr6nEtsV6Enzjxz2pDqoE"
}' http://localhost:8080/save-member


[113,154,196,249,251,248,198,116,19,104,102,173,218,135,205,227,227,179,179,184,25,7,242,128,8,209,160,39,38,99,218,152,178,89,12,233,233,89,37,201,228,156,171,238,113,143,72,205,158,98,122,60,11,92,186,127,63,190,14,17,104,107,128,238]

curl -X POST -H "Content-Type: application/json" -d '{
    "senderEmailAddress": "5eiqhs@example.com",
    "recipientEmailAddress": "51xgcg@test.com",
    "amount": "69",
    "privateKey": [113,154,196,249,251,248,198,116,19,104,102,173,218,135,205,227,227,179,179,184,25,7,242,128,8,209,160,39,38,99,218,152,178,89,12,233,233,89,37,201,228,156,171,238,113,143,72,205,158,98,122,60,11,92,186,127,63,190,14,17,104,107,128,238]
}' http://localhost:8080/send

export interface ApiSendRequest {
    senderEmailAddress: string;
    recipientEmailAddress: string;
    amount: number;
    privateKey: number[];
}

51xgcg@test.com
