import { Card } from "@circle-fin/circle-sdk";
import { CircleClient, CircleDepositArgs } from "../../circle/client";
import { ApiError } from "../../shared/error";

export class MockCircleClient implements CircleClient {
    private readonly cards: Map<string, Card> = new Map();
    private readonly balances: Map<string, number> = new Map();

    private constructor() {

    }

    public static make(): MockCircleClient {
        return new MockCircleClient();
    }

    public async transferUsdc(args: CircleDepositArgs): Promise<void> {
        this.balances.set(
            args.destinationAtaString,
            this.balances.get(args.destinationAtaString) ?? 0 + args.amount
        );
    }


    public async fetchCard(id: string): Promise<Card> {
        const result: Card | undefined = this.cards.get(id);
        if (result === undefined) {
            throw ApiError.noCardFound();
        }
        return result;
    }

}
