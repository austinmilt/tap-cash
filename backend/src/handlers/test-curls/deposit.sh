curl -X POST -H "Content-Type: application/json" -d '{
    "emailAddress": "gjimbn@random.com",
    "amount": "500"
}' http://localhost:8080/deposit


    emailAddress: string;
    amount: number;
