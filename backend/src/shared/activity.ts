import { PublicKey } from "../helpers/solana";
import { Currency } from "./currency";
import { AccountId, MemberPublicProfile } from "./member";

export interface MemberActivity {
    type: MemberActivityType;
    deposit?: DepositActivity;
    send?: SendActivity;
    receive?: ReceiveActivity;
    withdraw?: WithdrawActivity;
    timestamp?: number;
}


export enum MemberActivityType {
    DEPOSIT,
    SEND,
    RECEIVE,
    WITHDRAW,
    UNKNOWN
}


export interface DepositActivity {
    account: AccountId;
    currency: Currency;
    amount: number;
}


export interface SendActivity {
    recipient: PublicKey | MemberPublicProfile;
    currency: Currency;
    amount: number;
}


export interface ReceiveActivity {
    sender: PublicKey | MemberPublicProfile;
    currency: Currency;
    amount: number;
}



export interface WithdrawActivity {
    source: AccountId;
    currency: Currency;
    amount: number;
}
