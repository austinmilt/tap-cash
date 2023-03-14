import { Card } from "@circle-fin/circle-sdk";
import { EmailAddress } from "../shared/member";
import { CircleCardId } from "../types/types";

/**
 * Tap-specific Circle client for interacting with the Circle API.
 */
export interface CircleClient {
    depositUsdc(args: CircleDepositArgs): Promise<void>;
    fetchCard(id: string): Promise<Card>;
}

/**
 * This is the set of arguments that are needed to deposit funds into a user's account
 */
export interface CircleDepositArgs {
    /* The destination USDC associated token account to deposit the funds into */
    destinationAtaString: string;
    /* The amount of USDC to deposit */
    amount: number;
    /* The email address of the user */
    member: EmailAddress;
    /* The id of the card to use */
    cardId: CircleCardId;
    /* The cvv of the card to use */
    cardCvv: string;
}
