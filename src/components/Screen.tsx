import { StyleSheet } from "react-native";
import { ViewProps } from "react-native-ui-lib";
import { ViewStyleProps } from "../common/styles";
import { View } from "./View";

export function Screen(props: ViewProps & ViewStyleProps): JSX.Element {
    return (
        <View
            useSafeArea
            flexG
            {...props}
        >
            {props.children}
        </View>
    )
}

const STYLE = StyleSheet.create({
    base: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
    }
});
