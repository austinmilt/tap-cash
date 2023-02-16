import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";

import { Text } from "../components/Text";
import { useCallback, useEffect, useState } from "react";
import { useUserProfile } from "../components/profile-provider";

global.Buffer = global.Buffer || Buffer

interface Props {
    navigation: Navigation;
}

export function Authenticate({ navigation }: Props): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const { logIn, loggedIn } = useUserProfile();

    const logInSync = useCallback(() => {
        setLoading(true);
        //TODO error handling
        logIn().finally(() => setLoading(false));
    }, [setLoading, logIn]);

    return (
        <Screen>
            <View flex center>
                {loggedIn ? (
                    <Button.Primary
                        title="Tap That"
                        onPress={() => navigation.navigate(NavScreen.HOME)}
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
