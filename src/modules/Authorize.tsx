import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";

interface Props {
    navigation: Navigation;
}

export function Authorize({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <Button.Primary
                title="Log In"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
        </Screen>
    )
}
