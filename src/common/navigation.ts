import { MemberPublicProfile } from "../shared/member";

export enum TopNavScreen {
    SPLASH = "Splash",
    AUTHENTICATE = "Authenticate",
    HOME = "Home",
    PROFILE = "Profile",
    SEND = "Send"
}


export type TopRouteParams = {
    [TopNavScreen.HOME]: undefined;
    [TopNavScreen.AUTHENTICATE]: undefined;
    [TopNavScreen.PROFILE]: undefined;
    [TopNavScreen.SEND]: undefined;
    [TopNavScreen.SPLASH]: undefined;
}


export enum SendNavScreen {
    RECIPIENT_INPUT = "RecipientInput",
    AMOUNT_INPUT = "AmountInput",
    CONFIRM = "Confirm",
    SENDING = "Sending"
}


export type SendStackRouteParams = {
    [SendNavScreen.RECIPIENT_INPUT]: undefined;
    [SendNavScreen.AMOUNT_INPUT]: { recipient: MemberPublicProfile };
    [SendNavScreen.CONFIRM]: { recipient: MemberPublicProfile, amount: number, depositAmount: number };
    [SendNavScreen.SENDING]: { recipient: MemberPublicProfile, amount: number, depositAmount: number };
}


export enum ProfileNavScreen {
    OVERVIEW = "Overview",
    PAYMENT_METHODS = "PaymentMethods",
    CONNECTED_ACCOUNTS = "ConnectedAccounts",
    ADD_FUNDS = "AddFunds",
    WITHDRAW = "Withdraw",
    LOG_OUT = "LogOut"
}


export type ProfileStackRouteParams = {
    [ProfileNavScreen.OVERVIEW]: undefined;
    [ProfileNavScreen.PAYMENT_METHODS]: undefined;
    [ProfileNavScreen.CONNECTED_ACCOUNTS]: undefined;
    [ProfileNavScreen.ADD_FUNDS]: undefined;
    [ProfileNavScreen.WITHDRAW]: undefined;
    [ProfileNavScreen.LOG_OUT]: undefined;
}

