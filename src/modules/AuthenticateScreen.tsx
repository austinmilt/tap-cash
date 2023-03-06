import { NavScreen, Navigation } from "../common/navigation";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { View } from "../components/View";

interface Props {
    navigation: Navigation;
}

export function AuthenticateScreen({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <View flex center>
                <View center height="80%">
                    <AppLogo primary />
                </View>
                <View flexS centerH bottom gap-md padding-lg>
                    <Button
                        primary
                        label="G Continue with Google"
                        onPress={() => navigation.navigate(NavScreen.HOME)}
                    />
                    <Text sm>
                        By continuing, you accept our
                        Terms of use and Privacy Policy
                    </Text>
                </View>
            </View>
        </Screen>
    )
}
