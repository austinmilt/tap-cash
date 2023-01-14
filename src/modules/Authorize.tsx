import { View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";

interface Props {
    navigation: Navigation;
}

export function Authorize({ navigation }: Props): JSX.Element {
    return (
        <View>
            <Button.Primary
                title="Log In"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
