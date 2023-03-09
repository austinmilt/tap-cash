import { StyleSheet } from "react-native";
import { ViewProps } from "react-native-ui-lib";
import { ViewStyleProps, useViewStyle } from "../common/styles";
import { View } from "./View";

export function Screen(props: ViewProps & ViewStyleProps): JSX.Element {
    const styles = useViewStyle({ "gray-light": true });

    return (
        <View
            useSafeArea
            flexG
            style={styles}
            {...props}
        >
            {props.children}
        </View>
    )
}
