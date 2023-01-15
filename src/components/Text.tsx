import { StyleSheet, Text as NativeText, TextProps, TextStyle } from "react-native";
import { COLORS } from "../common/styles";
import { useMemo } from "react";

interface Props extends TextProps {
    size?: "sm" | "md" | "lg";
}


export function Text(props: Props): JSX.Element {
    const fontSize: TextStyle["fontSize"] = useMemo(() => {
        switch (props.size) {
            case "sm": return 12;
            case "lg": return 24;
            default: return 18;
        }
    }, [props.size])

    return (
        <NativeText
            {...props}
            style={[STYLE, {fontSize: fontSize}, props.style]}
        >
            {props.children}
        </NativeText>
    )
}

const STYLE = StyleSheet.create({
    style: {
        color: COLORS.primaryLight
    }
}).style;
