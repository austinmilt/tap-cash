import { StyleSheet } from "react-native";
import { COLORS } from "../common/styles";
import { Incubator, TextFieldProps } from "react-native-ui-lib";

export function TextInput(props: TextFieldProps): JSX.Element {
    return (
        <Incubator.TextField
            placeholderTextColor={COLORS.secondaryMedium}
            containerStyle={STYLE.container}
            {...props}
            style={[STYLE.text, props.style]}
        >
            {props.children}
        </Incubator.TextField>
    )
}

const STYLE = StyleSheet.create({
    text: {
        fontSize: 24,
        color: COLORS.secondaryLight
    },
    container: {
        borderColor: COLORS.secondaryDark,
        borderWidth: 1,
        borderRadius: 10,
        borderStyle: "solid",
        paddingHorizontal: 10,
    }
});
