curl -X POST -H "Content-Type: application/json" -d '{
    "emailAddress": "amilz@123.com",
    "profilePictureUrl": "https://test.net/1.png",
    "name": "tino",
    "signerAddressBase58": "Cxcfw2GC1tfEPEuNABNwTujwr6nEtsV6Enzjxz2pDqoE"
}' http://localhost:8080/new-member


    emailAddress: string;
    destinationAccountId: string;
    amount: number;