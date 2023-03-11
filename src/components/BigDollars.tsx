import { StyleSheet } from "react-native";
import { ViewStyleProps, useTextStyle } from "../common/styles"
import { Text } from "./Text";
import { formatUsd } from "../common/number";
import { View } from "./View";

export function BigDollars(props: { children: number } & ViewStyleProps): JSX.Element {
    const style = useTextStyle({
        "bold": true,
        "gray-dark": true
    });


    return (
        <View style={STYLES.container} {...props}>
            <Text style={[STYLES.leadingText, style]}>$</Text>
            <Text style={[STYLES.text, style]}>{formatUsd(props.children, { leadingSymbol: false, short: true })}</Text>
        </View>
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
        lineHeight: 53,
        textAlignVertical: "center"
    },

    leadingText: {
        fontSize: 40,
        marginRight: 5,
        textAlignVertical: "top",
        lineHeight: 53
    },

    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        height: 53,
        borderColor: "red",
        borderStyle: "solid",
        borderWidth: 1
    }
})
