import { Card, CvvResults } from "@circle-fin/circle-sdk";
import { v4 as uuid } from "uuid";

export function generateCircleCard(): Card {
    return {
        id: uuid(),
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
}
