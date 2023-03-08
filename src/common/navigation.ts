import { EmailAddress } from "../shared/member";

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
    [SendNavScreen.AMOUNT_INPUT]: { recipient: EmailAddress };
    [SendNavScreen.CONFIRM]: { recipient: EmailAddress, amount: number, depositAmount: number };
    [SendNavScreen.SENDING]: { recipient: EmailAddress, amount: number, depositAmount: number };
}

// TODO find the type in react-navigation stuff
// https://reactnavigation.org/docs/navigation-prop
export interface Navigation {
    navigate: (screen: string, params?: object) => void;
    goBack: () => void;
    pop: () => void;
}


// TODO find the type in react-navigation stuff
export interface Route {
    params: { [param: string]: any };
}
