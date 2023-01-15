import { NavScreen, Navigation, Route } from "../../common/navigation";
import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { Screen } from "../../components/Screen";
import { View } from "../../components/View";

interface Props {
    route: Route;
    navigation: Navigation;
}


export function ConfirmSend({ route, navigation }: Props): JSX.Element {
    return (
        <Screen>
            <Text>You're about to send</Text>
            <Text>${route?.params.amount}</Text>
            <Text>to</Text>
            <Text>{route?.params.recipient}</Text>
            <Text>and they're gonna be so happy about it.</Text>
            <View direction="row">
                <Button.Secondary
                    title="Cancel"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
                <Button.Primary
                    title="Confirm"
                    onPress={() => navigation.navigate(NavScreen.SEND_SENDING, {...route.params})}
                />
            </View>
        </Screen>
    )
}
