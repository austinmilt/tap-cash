export enum NavScreen {
    AUTHORIZE = "Authorize",
    HOME = "Home",
    PROFILE = "Profile",
    SEND = "Send",
    SEND_RECIPIENT_INPUT = "SendRecipientInput",
    SEND_AMOUNT_INPUT = "SendAmountInput",
    SEND_CONFIRM = "SendConfirm",
    SEND_SENDING = "SendSending",
}

// TODO find the type in react-navigation stuff
export interface Navigation {
    navigate: (screen: string, params?: object) => void;
}


// TODO find the type in react-navigation stuff
export interface Route {
    params: {[param: string]: any};
}
