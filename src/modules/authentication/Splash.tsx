import { useEffect } from "react";
import { NavScreen, Navigation } from "../../common/navigation";
import { Screen } from "../../components/Screen";
import { View } from "../../components/View";
import { AppLogo } from "../../components/AppLogo";

interface Props {
    navigation: Navigation;
}

export function SplashScreen(props: Props): JSX.Element {
    useEffect(() => {
        setTimeout(() => props.navigation.navigate(NavScreen.AUTHENTICATE), 1500);
    }, []);

    return (
        <Screen primary-medium>
            <View flex center>
                <AppLogo secondary />
            </View>
        </Screen>
    )
}



