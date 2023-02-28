import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { Text } from "../components/Text";
import { NEW_MEMBER_URI } from "../common/constants";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <Text>
                $420.69
                {NEW_MEMBER_URI}
            </Text>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap={10}>
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
