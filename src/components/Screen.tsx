import { StyleSheet, ViewProps } from "react-native";
import { COLORS } from "../common/styles";
import { View } from "react-native-ui-lib";

export function Screen(props: ViewProps): JSX.Element {
    return (
        <View
            {...props}
            style={[STYLE, props.style]}
            useSafeArea
        >
            {props.children}
        </View>
    )
}

const STYLE = StyleSheet.create({
    style: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.secondaryDark,
    }
}).style;
