import { Button, View } from "react-native";
import { NavScreen } from "../common/navigation";

export function Home({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Send"
                onPress={() => navigation.navigate(NavScreen.SEND)}
            />
            <Button
                title="Profile"
                onPress={() => navigation.navigate(NavScreen.PROFILE)}
            />
        </View>
    )
}
