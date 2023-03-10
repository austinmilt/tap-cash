import { StyleSheet } from "react-native";
import { ViewProps } from "react-native-ui-lib";
import { ViewStyleProps } from "../common/styles";
import { View } from "./View";

export function Screen(props: ViewProps & ViewStyleProps): JSX.Element {

    return (
        <View
            useSafeArea
            flexG
            whiteish
            {...props}
        >
            {props.children}
        </View>
    )
}
