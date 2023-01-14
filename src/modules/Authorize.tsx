import { Button, View } from "react-native";
import { NavScreen, Navigation } from "../common/navigation";

interface Props {
    navigation: Navigation;
}

export function Authorize({ navigation }: Props): JSX.Element {
    return (
        <View>
            <Button
                title="Log In"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </View>
    )
}
