import { useCallback, useEffect, useState } from "react";
import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { AppLogo } from "../components/AppLogo";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Text } from "../components/Text";
import { View } from "../components/View";
import { useUserProfile } from "../components/profile-provider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Loading } from "../components/Loading";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.AUTHENTICATE>;

export function AuthenticateScreen({ navigation }: Props): JSX.Element {
    const userContext = useUserProfile();
    const [startedLogin, setStartedLogin] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState<boolean>(false);

    useEffect(() => {
        if (userContext.profileReady) {
            navigation.navigate(TopNavScreen.HOME);
        }
    }, [userContext.profileReady]);

    const onContinue = useCallback(() => {
        // A bit of a hack to make the loader only show
        // when returning from web3auth. It would be better
        // to be able to distinguish between before and after
        // successful login but we dont have that yet.
        setTimeout(() => setShowLoading(true), 750);
        setStartedLogin(true);
        userContext.logIn();
    }, [userContext.logIn, setStartedLogin]);

    // allow the user to log in if they get logged out while on
    // this screen
    useEffect(() => {
        if (!userContext.loggedIn) {
            setStartedLogin(false);
            setShowLoading(false);
        }
    }, [userContext.loggedIn]);

    return (
        <Screen>
            {showLoading && <Loading />}
            {!startedLogin && (
                <View flex center>
                    <View center height="80%">
                        <AppLogo primary />
                    </View>
                    <View flexS centerH bottom gap-md padding-lg>
                        <Button
                            label="G Continue with Google"
                            primary
                            onPress={onContinue}
                            disabled={startedLogin}
                        />
                        <Text text-sm>
                            Welcome to the Tap demo, which
                            uses fake money but displays your actual
                            Google email, name, and profile picture
                            to other users in the app.
                            By continuing you agree to this use.
                        </Text>
                    </View>
                </View>
            )}
            {(userContext.error !== undefined) && (
                <Text error>{userContext.error.message}</Text>
            )}
        </Screen>
    )
}
