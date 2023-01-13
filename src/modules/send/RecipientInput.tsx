import { Button, View } from "react-native";
import { NavScreen } from "../../common/navigation";

export function RecipientInput({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to amount input"
                onPress={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT)}
            />
            <Button
                title="Go back to home"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
