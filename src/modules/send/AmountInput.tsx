import { Button, View } from "react-native";
import { NavScreen } from "../../common/navigation";

export function AmountInput({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to confirm"
                onPress={() => navigation.navigate(NavScreen.SEND_CONFIRM)}
            />
            <Button
                title="Go back to name input"
                onPress={() => navigation.navigate(NavScreen.SEND_RECIPIENT_INPUT)}
            />
        </View>
    )
}
