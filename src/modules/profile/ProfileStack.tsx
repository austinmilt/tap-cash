import { NativeStackScreenProps, createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackRouteParams, ProfileNavScreen, TopRouteParams, TopNavScreen } from "../../common/navigation";
import { ProfileOverviewScreen } from "./ProfileSummaryScreen";
import { PaymentMethodsScreen } from "./PaymentMethodsScreen";

const Stack = createNativeStackNavigator<ProfileStackRouteParams>();

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.PROFILE>;

export function ProfileStack(props: Props): JSX.Element {
    return (
        <Stack.Navigator
            initialRouteName={ProfileNavScreen.OVERVIEW}>
            <Stack.Screen
                name={ProfileNavScreen.OVERVIEW}
                component={ProfileOverviewScreen}
                options={{ title: "My Account" }}
            />
            <Stack.Screen
                name={ProfileNavScreen.PAYMENT_METHODS}
                component={PaymentMethodsScreen}
                options={{ title: "Payment Methods" }}
            />
        </Stack.Navigator>
    )
}
