import { StyleSheet } from "react-native";
import { View as RNUIView, ViewProps } from "react-native-ui-lib";
import { COLORS } from "../common/styles";


interface Props extends ViewProps {
    gap?: number;
    debug?: boolean;
}


export function View(props: Props): JSX.Element {
    const style = [
        STYLES.base,
        props.debug && STYLES.debug,
        props.style,
        (props.gap !== undefined) && {gap: props.gap}
    ]

    return (
        <RNUIView flexG style={style} {...props}>
            {props.children}
        </RNUIView>
    )
}

const STYLES = StyleSheet.create({
    base: {
        backgroundColor: COLORS.secondaryDark
    },

    debug: {
        borderWidth: 1,
        borderColor: "red",
        borderStyle: "solid"
    }
});
