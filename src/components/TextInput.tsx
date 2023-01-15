import { StyleSheet, TextInput as NativeTextInput, TextInputProps } from "react-native";
import { COLORS } from "../common/styles";

export function TextInput(props: TextInputProps): JSX.Element {
    return (
        <NativeTextInput
            placeholderTextColor={COLORS.primaryMedium}
            {...props}
            style={[STYLE, props.style]}
        >
            {props.children}
        </NativeTextInput>
    )
}

const STYLE = StyleSheet.create({
    style: {
        fontSize: 24,
        color: COLORS.primaryLight
    },
}).style;
