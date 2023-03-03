import { Card } from "@circle-fin/circle-sdk";
import { CircleClient, CircleDepositArgs } from "../../circle/client";
import { ApiError } from "../../shared/error";
import { MockTapCashClient } from "./MockTapCashClient";
import { PublicKey } from "../../helpers/solana";

export class MockCircleClient implements CircleClient {
    private readonly tapClient: MockTapCashClient;
    private readonly cards: Map<string, Card> = new Map();
    private readonly balances: Map<string, number> = new Map();

    private constructor(tapClient: MockTapCashClient) {
        this.tapClient = tapClient;
    }

    public static make(tapClient: MockTapCashClient): MockCircleClient {
        return new MockCircleClient(tapClient);
    }

    public async transferUsdc(args: CircleDepositArgs): Promise<void> {
        this.balances.set(
            args.destinationAtaString,
            this.balances.get(args.destinationAtaString) ?? 0 + args.amount
        );
        const userId: PublicKey | undefined = this.tapClient.getMemberIdFromAta(new PublicKey(args.destinationAtaString));
        if (userId === undefined) throw ApiError.noSuchMember(args.destinationAtaString);
        const balance: number | undefined = this.tapClient.getMemberAccount(userId)?.balance;
        if (balance === undefined) throw ApiError.noSuchMember(args.destinationAtaString);
        this.tapClient.setMemberBalance(userId, balance + args.amount);
    }


    public async fetchCard(id: string): Promise<Card> {
        const result: Card | undefined = this.cards.get(id);
        if (result === undefined) {
            throw ApiError.noCardFound();
        }
        return result;
    }

}
