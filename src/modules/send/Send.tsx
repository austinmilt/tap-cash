import { NavScreen } from "../../common/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecipientInput } from "./RecipientInput";
import { AmountInput } from "./AmountInput";
import { ConfirmSend } from "./ConfirmSend";
import { Sending } from "./Sending";

const Stack = createNativeStackNavigator();

//TODO https://reactnavigation.org/docs/typescript

export function Send(): JSX.Element {
    return (
        <Stack.Navigator  initialRouteName={NavScreen.AUTHORIZE} screenOptions={{headerShown: false}}>
            <Stack.Screen
                name={NavScreen.SEND_RECIPIENT_INPUT}
                component={RecipientInput}
            />
            <Stack.Screen
                name={NavScreen.SEND_AMOUNT_INPUT}
                //@ts-ignore fuck shitty implicit prop drilling
                component={AmountInput}
            />
            <Stack.Screen
                name={NavScreen.SEND_CONFIRM}
                //@ts-ignore fuck shitty implicit prop drilling
                component={ConfirmSend}
                />
            <Stack.Screen
                name={NavScreen.SEND_SENDING}
                //@ts-ignore fuck shitty implicit prop drilling
                component={Sending}
            />
        </Stack.Navigator>

    )
}
