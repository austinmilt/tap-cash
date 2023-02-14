import { StyleSheet, TextProps, TextStyle } from "react-native";
import { COLORS } from "../common/styles";
import { useMemo } from "react";
import { Text as RNUIText } from "react-native-ui-lib";

interface Props extends TextProps {
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    color?: string;
}


export function Text(props: Props): JSX.Element {
    const fontSize: TextStyle["fontSize"] = useMemo(() => {
        switch (props.size) {
            case "sm": return 12;
            case "lg": return 24;
            case "xl": return 36;
            case "2xl": return 48;
            default: return 18;
        }
    }, [props.size])

    const style = [
        { fontSize: fontSize },
        STYLE,
        props.color && {color: props.color}
    ]

    return (
        <RNUIText {...props} style={style} >
            {props.children}
        </RNUIText>
    )
}

const STYLE = StyleSheet.create({
    style: {
        color: COLORS.secondaryLight
    }
}).style;
