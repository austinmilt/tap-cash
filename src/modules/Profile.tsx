import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";

interface Props {
    navigation: Navigation;
}

export function Profile({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <Button.Primary
                title="Home"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </Screen>
    )
}
