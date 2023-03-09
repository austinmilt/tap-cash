import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { STACK_DEFAULTS, SendNavScreen, SendStackRouteParams, TopNavScreen, TopRouteParams } from "../../common/navigation";
import { RecipientInputScreen } from "./RecipientInputScreen";
import { AmountInputScreen } from "./AmountInputScreen";
import { ConfirmScreen } from "./ConfirmScreen";
import { SendingScreen } from "./SendingScreen";

const Stack = createNativeStackNavigator<SendStackRouteParams>();

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.SEND>;

// more on styling/formatting the stack header at
// https://reactnavigation.org/docs/screen-options

export function SendStack(props: Props): JSX.Element {
    return (
        <Stack.Navigator
            initialRouteName={SendNavScreen.RECIPIENT_INPUT}
            screenOptions={STACK_DEFAULTS}
        >
            <Stack.Screen
                name={SendNavScreen.RECIPIENT_INPUT}
                component={RecipientInputScreen}
                options={{ title: "Recipient" }}
            />
            <Stack.Screen
                name={SendNavScreen.AMOUNT_INPUT}
                component={AmountInputScreen}
                options={{ title: "Amount" }}
            />
            <Stack.Screen
                name={SendNavScreen.CONFIRM}
                component={ConfirmScreen}
                options={{ title: "Confirm" }}
            />
            <Stack.Screen
                name={SendNavScreen.SENDING}
                component={SendingScreen}
                options={{ title: "Sending" }}
            />
        </Stack.Navigator>
    )
}
