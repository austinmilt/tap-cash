import { NavScreen } from "../../common/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecipientInput } from "./RecipientInput";
import { AmountInput } from "./AmountInput";
import { ConfirmSend } from "./ConfirmSend";
import { Sending } from "./Sending";

const Stack = createNativeStackNavigator();

//TODO https://reactnavigation.org/docs/typescript

export function Send({ navigation }): JSX.Element {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name={NavScreen.SEND_RECIPIENT_INPUT}
                component={RecipientInput}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name={NavScreen.SEND_AMOUNT_INPUT}
                component={AmountInput}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name={NavScreen.SEND_CONFIRM}
                component={ConfirmSend}
                options={{headerShown: false}}
            />
            <Stack.Screen
                name={NavScreen.SEND_SENDING}
                component={Sending}
                options={{headerShown: false}}
            />
        </Stack.Navigator>

    )
}
