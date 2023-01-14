import { View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";

interface Props {
    navigation: Navigation;
}

export function Profile({ navigation }: Props): JSX.Element {
    return (
        <View>
            <Button.Primary
                title="Home"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
