import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";

import { useCallback, useState } from "react";
import { useUserProfile } from "../components/profile-provider";

interface Props {
    navigation: Navigation;
}

export function Authenticate({ navigation }: Props): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const { logIn, loggedIn } = useUserProfile();

    const afterLogIn = useCallback(() => navigation.navigate(NavScreen.HOME), [navigation]);

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
                {loggedIn ? (
                    <Button.Primary
                        title="Tap That"
                        onPress={afterLogIn}
                        disabled={loading}
                    />
                ) : (
                    <Button.Primary
                        title="Log In with Google"
                        onPress={logInSync}
                        disabled={loading}
                    />
                )}
            </View>
        </Screen>
    )
}
