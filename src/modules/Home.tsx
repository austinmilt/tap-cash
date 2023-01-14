import { Button, View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
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
