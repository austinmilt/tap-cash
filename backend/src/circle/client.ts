import { ChannelResponse, Circle } from "@circle-fin/circle-sdk";
import { PaymentsApiFactory } from "@circle-fin/circle-sdk/dist/generated/api";
import { CIRCLE_API_KEY, CIRCLE_ENVIRONMENT } from "../constants";
import fetch from 'node-fetch';

export class CircleClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleClient {
        return new CircleClient(new Circle(CIRCLE_API_KEY, CIRCLE_ENVIRONMENT));
    }

    public async createAndSendPayment(/* later add payment config obj */): Promise<string | undefined> {
        
        let payementResponse = await this.sdk.payments.createPayment({
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
        });
   
        let txId = payementResponse.data.data?.id;

        return txId;
    }
    /**
     * Dunno what this is for, just an example.
     *
     * @returns
     */
    public async listChannels(): Promise<ChannelResponse[] | undefined> {
        const result = await this.sdk.channels.listChannels();
        return result.data.data;
    }
}
