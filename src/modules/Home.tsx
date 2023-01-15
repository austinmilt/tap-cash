import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <View direction="row">
                <Button.Primary
                    title="Profile"
                    onPress={() => navigation.navigate(NavScreen.PROFILE)}
                />
                <Button.Primary
                    title="Send"
                    onPress={() => navigation.navigate(NavScreen.SEND)}
                />
            </View>
        </Screen>
    )
}
