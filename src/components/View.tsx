import { useMemo } from "react";
import { View as NativeView, ViewProps, StyleSheet, ViewStyle } from "react-native";


interface Props extends ViewProps {
    direction: "row" | "column";
    justify?: "center" | "start" | "end";
    align?: "center" | "start" | "end";
    debug?: boolean;
}


export function View(props: Props): JSX.Element {
    const directionStyle: ViewStyle = useMemo(() => {
        if (props.direction === "column") {
            return {
                flexDirection: "column"
            }
        } else {
            return {
                flexDirection: "row"
            }
        }
    }, [props.direction]);


    const justifyContent: ViewStyle["justifyContent"] = useMemo(() => {
        if (props.justify === "end") return "flex-end";
        if (props.justify === "start") return "flex-start";
        return "center";
    }, [props.justify]);


    const alignItems: ViewStyle["alignItems"] = useMemo(() => {
        if (props.align === "end") return "flex-end";
        if (props.align === "start") return "flex-start";
        return "center";
    }, []);


    const dynamicStyle: ViewStyle = useMemo(() => ({
        ...directionStyle,
        justifyContent: justifyContent,
        alignItems: alignItems
    }), [justifyContent, alignItems]);


    return (
        <NativeView style={[STYLES.base, dynamicStyle, props.debug && STYLES.debug, props.style]}>
            {props.children}
        </NativeView>
    )
}

const STYLES = StyleSheet.create({
    base: {
        display: "flex",
        flex: 1
    },

    debug: {
        borderWidth: 1,
        borderColor: "red",
        borderStyle: "solid"
    }
});
