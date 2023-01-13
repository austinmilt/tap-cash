import { Button, View } from "react-native";
import { NavScreen } from "../common/navigation";

export function Authorize({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to Home"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
