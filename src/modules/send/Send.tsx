import { Button, View } from "react-native";
import { NavScreen } from "../../common/navigation";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RecipientInput } from "./RecipientInput";
import { AmountInput } from "./AmountInput";
import { ConfirmSend } from "./ConfirmSend";
import { Sending } from "./Sending";

const Tab = createNativeStackNavigator();

export function Send({ navigation }): JSX.Element {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name={NavScreen.SEND_RECIPIENT_INPUT}
                component={RecipientInput}
                options={{headerShown: false}}
            />
            <Tab.Screen
                name={NavScreen.SEND_AMOUNT_INPUT}
                component={AmountInput}
                options={{headerShown: false}}
            />
            <Tab.Screen
                name={NavScreen.SEND_CONFIRM}
                component={ConfirmSend}
                options={{headerShown: false}}
            />
            <Tab.Screen
                name={NavScreen.SEND_SENDING}
                component={Sending}
                options={{headerShown: false}}
            />
        </Tab.Navigator>

    )
}
