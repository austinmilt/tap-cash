import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackRouteParams, ProfileNavScreen, DepositStackRouteParams, DepositNavScreen } from "../../common/navigation";
import { AmountInputScreen } from "./AmountInputScreen";
import { DepositingScreen } from "./DepositingScreen";

const Stack = createNativeStackNavigator<DepositStackRouteParams>();

type Props = NativeStackScreenProps<ProfileStackRouteParams, ProfileNavScreen.ADD_FUNDS>;

export function DepositStack(props: Props): JSX.Element {
    return (
        <Stack.Navigator
            initialRouteName={DepositNavScreen.AMOUNT_INPUT}>
            <Stack.Screen
                name={DepositNavScreen.AMOUNT_INPUT}
                component={AmountInputScreen}
                options={{ title: "Add Funds" }}
            />
            <Stack.Screen
                name={DepositNavScreen.DEPOSITING}
                component={DepositingScreen}
                options={{ title: "Depositing" }}
            />
        </Stack.Navigator>
    )
}
