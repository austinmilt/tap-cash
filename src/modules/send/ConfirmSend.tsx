import { Button, View } from "react-native";
import { NavScreen } from "../../common/navigation";

export function ConfirmSend({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Confirm"
                onPress={() => navigation.navigate(NavScreen.SEND_SENDING)}
            />
            <Button
                title="Go back to amount input"
                onPress={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT)}
            />
        </View>
    )
}
