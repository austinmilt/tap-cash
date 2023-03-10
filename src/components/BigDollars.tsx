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
        <View row center {...props}>
            <Text style={[STYLES.leadingText, style]}>$</Text>
            <Text style={[STYLES.text, style]}>{formatUsd(props.children, { leadingSymbol: false, short: true })}</Text>
        </View>
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
    },

    leadingText: {
        fontSize: 40,
        marginRight: 5,
        alignSelf: "flex-start"
    }
})
