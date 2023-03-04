import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { Text } from "../components/Text";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <Text>
                $420.69
            </Text>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap-sm>
                <Button
                    primary
                    label="Profile"
                    onPress={() => navigation.navigate(NavScreen.PROFILE)}
                />
                <Button
                    primary
                    label="Send"
                    onPress={() => navigation.navigate(NavScreen.SEND)}
                />
            </View>
        </Screen>
    )
}
