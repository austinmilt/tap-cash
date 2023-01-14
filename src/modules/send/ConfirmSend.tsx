import { Button, Text, View } from "react-native";
import { NavScreen } from "../../common/navigation";

export function ConfirmSend({ route, navigation }): JSX.Element {
    return (
        <View>
            <Text>You're about to send</Text>
            <Text>${route.params.amount}</Text>
            <Text>to</Text>
            <Text>{route.params.recipient}</Text>
            <Text>and they're gonna be so happy about it.</Text>
            <Button
                title="Confirm"
                onPress={() => navigation.navigate(NavScreen.SEND_SENDING, {...route.params})}
            />
            <Button
                title="Cancel"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
