import { ChannelResponse, Circle } from "@circle-fin/circle-sdk";
import { CIRCLE_API_KEY, CIRCLE_ENVIRONMENT } from "../constants";

export class CircleClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleClient {
        return new CircleClient(new Circle(CIRCLE_API_KEY, CIRCLE_ENVIRONMENT));
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
