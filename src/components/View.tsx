import { useMemo } from "react";
import { View as NativeView, ViewProps, StyleSheet, ViewStyle } from "react-native";


interface Props extends ViewProps {
    justify?: "center" | "start" | "end";
    align?: "center" | "start" | "end";
    direction: "row" | "column"
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
        <NativeView style={[BASE, dynamicStyle, props.style]}>
            {props.children}
        </NativeView>
    )
}

const BASE = StyleSheet.create({
    style: {
        display: "flex",
        flex: 1
    }
}).style;


const { ROW, COLUMN } = StyleSheet.create({
    ROW: {
        ...BASE,
        flexDirection: "row",
    },

    COLUMN: {
        ...BASE,
        flexDirection: "column"
    }
});
