import { Button, View } from "react-native";
import { NavScreen } from "../common/navigation";

export function Authorize({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Log In"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
