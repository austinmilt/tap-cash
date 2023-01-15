import { StyleSheet, Text as NativeText, TextProps } from "react-native";
import { COLORS } from "../common/styles";

export function Text(props: TextProps): JSX.Element {
    return (
        <NativeText
            {...props}
            style={[STYLE, props.style]}
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
