import { View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
    return (
        <View>
            <Button.Primary
                title="Send"
                onPress={() => navigation.navigate(NavScreen.SEND)}
            />
            <Button.Primary
                title="Profile"
                onPress={() => navigation.navigate(NavScreen.PROFILE)}
            />
        </View>
    )
}
