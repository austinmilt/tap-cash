import { useCallback, useState } from "react";
import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { View } from "../components/View";
import { useUserProfile } from "../components/profile-provider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.AUTHENTICATE>;

export function AuthenticateScreen({ navigation }: Props): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const { logIn, loggedIn } = useUserProfile();

    const afterLogIn = useCallback(() => navigation.navigate(TopNavScreen.HOME), [navigation]);

    const logInSync = useCallback(() => {
        setLoading(true);
        //TODO error handling
        logIn()
            .then(afterLogIn)
            .finally(() => setLoading(false));

    }, [setLoading, logIn, afterLogIn]);

    return (
        <Screen>
            <View flex center>
                <View center height="80%">
                    <AppLogo primary />
                </View>
                <View flexS centerH bottom gap-md padding-lg>
                    {loggedIn ? (
                        <Button
                            label="G Continue with Google"
                            primary
                            onPress={afterLogIn}
                            disabled={loading}
                        />
                    ) : (
                        <Button
                            label="G Continue with Google"
                            primary
                            onPress={logInSync}
                            disabled={loading}
                        />
                    )}
                    <Text sm>
                        By continuing, you accept our
                        Terms of use and Privacy Policy
                    </Text>
                </View>
            </View>
        </Screen>
    )
}
