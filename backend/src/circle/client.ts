import { Card } from "@circle-fin/circle-sdk";
import { EmailAddress } from "../shared/member";
import { CircleCardId } from "../types/types";

export interface CircleClient {
    depositUsdc(args: CircleDepositArgs): Promise<void>;
    fetchCard(id: string): Promise<Card>;
}

export interface CircleDepositArgs {
    destinationAtaString: string;
    amount: number;
    member: EmailAddress;
    cardId: CircleCardId;
    cardCvv: string;
}
