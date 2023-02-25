import { ApiMemberActivity } from "./api";
import { Currency } from "./currency";
import { AccountId, MemberPublicProfile } from "./member";

export interface MemberActivity {
    type: MemberActivityType;
    deposit?: DepositActivity;
    send?: SendActivity;
    receive?: ReceiveActivity;
    withdraw?: WithdrawActivity;
}


export enum MemberActivityType {
    DEPOSIT,
    SEND,
    RECEIVE,
    WITHDRAW
}


export interface DepositActivity {
    account: AccountId;
    currency: Currency;
    amount: number;
}


export interface SendActivity {
    recipient: MemberPublicProfile;
    currency: Currency;
    amount: number;
}


export interface ReceiveActivity {
    sender: MemberPublicProfile;
    currency: Currency;
    amount: number;
}


export interface WithdrawActivity {
    source: AccountId;
    currency: Currency;
    amount: number;
}
