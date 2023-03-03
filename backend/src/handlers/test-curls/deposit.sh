curl -X POST -H "Content-Type: application/json" -d '{
    "emailAddress": "gjimbn@random.com",
    "destinationAccountId": "5F3ZQZrZ",
    "amount": "500"
}' http://localhost:8080/deposit


    emailAddress: string;
    destinationAccountId: string;
    amount: number;
