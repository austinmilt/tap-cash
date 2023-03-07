import { Incubator, TextFieldProps } from "react-native-ui-lib";
import { TextStyleProps, ViewStyleProps, useTextStyle, useViewStyle } from "../common/styles";
import { TextProps } from "./Text";
import { StyleSheet } from "react-native";

type Props = TextFieldProps & TextProps & TextStyleProps & {
    inputFieldStyle?: ViewStyleProps
}

export function TextInput(props: Props): JSX.Element {
    const textStyle = useTextStyle({
        "gray-dark": true,
        "text-md": true,
        ...props
    });
    const fieldStyle = useViewStyle({
        ...props.inputFieldStyle
    });

    return (
        <Incubator.TextField
            style={[STYLE.textBase, textStyle]}
            fieldStyle={[STYLE.fieldBase, fieldStyle]}
            {...props}
        >
            {props.children}
        </Incubator.TextField>
    )
}

const STYLE = StyleSheet.create({
    fieldBase: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    textBase: {
        textDecorationLine: "none"
    }
});
