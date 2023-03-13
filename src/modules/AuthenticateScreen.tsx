import { useEffect } from "react";
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

    useEffect(() => {
        if (userContext.profileReady) {
            navigation.navigate(TopNavScreen.HOME);
        }
    }, [userContext.profileReady]);

    return (
        <Screen>
            {userContext.loading && <Loading />}
            {!userContext.loading && (
                <View flex center>
                    <View center height="80%">
                        <AppLogo primary />
                    </View>
                    <View flexS centerH bottom gap-md padding-lg>
                        <Button
                            label="G Continue with Google"
                            primary
                            onPress={userContext.logIn}
                            disabled={userContext.loading}
                        />
                        <Text text-sm>
                            By continuing, you accept our
                            Terms of use and Privacy Policy
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
