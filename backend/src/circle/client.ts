import { ChannelResponse, Circle, CircleEnvironments } from "@circle-fin/circle-sdk";
import { CIRCLE_API_KEY } from "../constants";

export class CircleClient {
    private readonly sdk: Circle;

    private constructor(sdk: Circle) {
        this.sdk = sdk;
    }


    public static ofDefaults(): CircleClient {
        return new CircleClient(new Circle(CIRCLE_API_KEY, CircleEnvironments.sandbox));
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
