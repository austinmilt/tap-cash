import { useCallback, useState } from "react";
import { Navigation } from "../common/navigation";
import { Screen } from "../components/Screen";
import { View } from "../components/View";

import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { Button } from "../components/Button";

GoogleSignin.configure();

interface Props {
    navigation: Navigation;
}

export function Authenticate2({ navigation }: Props): JSX.Element {
    const [userInfo, setUserInfo] = useState<any>();
    const [signingIn, setSigningIn] = useState<boolean>(false);

    const signIn: () => Promise<void> = useCallback(async () => {
        setSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            setUserInfo(userInfo);
            console.log(userInfo);

            //TODO better type
        } catch (error: any) {
            console.error(error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        } finally {
            setSigningIn(false);
        }
    }, []);

    return (
        <Screen>
            <View flex center>
                {/* <GoogleSigninButton
                    style={{ width: 192, height: 48 }}
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Dark}
                    onPress={signIn}
                    disabled={signingIn}
                />; */}
                <Button.Primary title="Sign in with Google" onPress={signIn} />
            </View>
        </Screen>
    )
}
