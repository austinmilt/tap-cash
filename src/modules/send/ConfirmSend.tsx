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
            <View direction="column">
                <View direction="column" justify="center">
                    <Text size="lg">You're about to send</Text>
                    <Text size="lg">${route?.params.amount}</Text>
                    <Text size="lg">to</Text>
                    <Text size="lg">{route?.params.recipient}</Text>
                    <Text size="sm">and they're gonna be so happy about it.</Text>
                </View>
                <View direction="row" align="end">
                    <Button.Secondary
                        title="Cancel"
                        onPress={() => navigation.navigate(NavScreen.HOME)}
                    />
                    <Button.Primary
                        title="Confirm"
                        onPress={() => navigation.navigate(NavScreen.SEND_SENDING, {...route.params})}
                    />
                </View>
            </View>
        </Screen>
    )
}
