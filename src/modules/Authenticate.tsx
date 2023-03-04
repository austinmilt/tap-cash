import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";

interface Props {
    navigation: Navigation;
}

export function Authenticate({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <View flex center>
                <Button
                    primary
                    label="Log In"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
            </View>
        </Screen>
    )
}
