import { Card } from "@circle-fin/circle-sdk";

export interface CircleClient {
    transferUsdc(args: CircleDepositArgs): Promise<void>;
    fetchCard(id: string): Promise<Card>;
}

export interface CircleDepositArgs {
    destinationAtaString: string,
    amount: number
}
