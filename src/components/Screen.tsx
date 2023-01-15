import { SafeAreaView, StyleSheet, ViewProps } from "react-native";
import { COLORS } from "../common/styles";

export function Screen(props: ViewProps): JSX.Element {
    return (
        <SafeAreaView
            {...props}
            style={[STYLE, props.style]}
        >
            {props.children}
        </SafeAreaView>
    )
}

const STYLE = StyleSheet.create({
    style: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: COLORS.primaryDark,
    }
}).style;
