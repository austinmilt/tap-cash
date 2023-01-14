import { Text, View } from "react-native";
import { NavScreen, Navigation, Route } from "../../common/navigation";
import { Button } from "../../components/Button";

interface Props {
    route: Route;
    navigation: Navigation;
}


export function ConfirmSend({ route, navigation }: Props): JSX.Element {
    return (
        <View>
            <Text>You're about to send</Text>
            <Text>${route?.params.amount}</Text>
            <Text>to</Text>
            <Text>{route?.params.recipient}</Text>
            <Text>and they're gonna be so happy about it.</Text>
            <Button.Primary
                title="Confirm"
                onPress={() => navigation.navigate(NavScreen.SEND_SENDING, {...route.params})}
            />
            <Button.Secondary
                title="Cancel"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
