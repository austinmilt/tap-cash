import { Button, View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";

interface Props {
    navigation: Navigation;
}

export function Profile({ navigation }: Props): JSX.Element {
    return (
        <View>
            <Button
                title="Home"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
