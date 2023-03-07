import { useEffect } from "react";
import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { AppLogo } from "../components/AppLogo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.SPLASH>;

export function SplashScreen(props: Props): JSX.Element {
    useEffect(() => {
        setTimeout(() => props.navigation.navigate(TopNavScreen.AUTHENTICATE), 1500);
    }, []);

    return (
        <Screen primary-medium>
            <View flex center>
                <AppLogo secondary />
            </View>
        </Screen>
    )
}



