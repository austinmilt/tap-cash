import { SafeAreaView, StyleSheet, ViewProps } from "react-native";
import { CircleProvider } from "../api/circle/CircleProvider";
import { COLORS } from "../common/styles";

export function Screen(props: ViewProps): JSX.Element {
    return (
        <CircleProvider>
            <SafeAreaView
                {...props}
                style={[STYLE, props.style]}
            >
                {props.children}
            </SafeAreaView>
        </CircleProvider>
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
