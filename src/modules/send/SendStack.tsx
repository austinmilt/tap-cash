import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { SendNavScreen, SendStackRouteParams, TopNavScreen, TopRouteParams } from "../../common/navigation";
import { RecipientInputScreen } from "./RecipientInputScreen";
import { AmountInputScreen } from "./AmountInputScreen";
import { ConfirmSendScreen } from "./ConfirmSendScreen";
import { SendingScreen } from "./SendingScreen";

const Stack = createNativeStackNavigator<SendStackRouteParams>();

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.SEND>;

export function SendStack(props: Props): JSX.Element {
    return (
        <Stack.Navigator initialRouteName={SendNavScreen.RECIPIENT_INPUT}>
            <Stack.Screen
                name={SendNavScreen.RECIPIENT_INPUT}
                component={RecipientInputScreen}
            />
            <Stack.Screen
                name={SendNavScreen.AMOUNT_INPUT}
                component={AmountInputScreen}
            />
            <Stack.Screen
                name={SendNavScreen.CONFIRM}
                component={ConfirmSendScreen}
            />
            <Stack.Screen
                name={SendNavScreen.SENDING}
                component={SendingScreen}
            />
        </Stack.Navigator>
    )
}
