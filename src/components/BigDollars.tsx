import { StyleSheet } from "react-native";
import { ViewStyleProps } from "../common/styles"
import { Text } from "./Text";
import { formatUsd } from "../common/number";

export function BigDollars(props: { children: number } & ViewStyleProps): JSX.Element {
    return (
        <Text bold gray-dark center style={[STYLES.text]}>{formatUsd(props.children, { leadingSymbol: true, short: true })}</Text>
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
        textAlignVertical: "center"
    },
})
