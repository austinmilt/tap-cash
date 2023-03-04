import { Incubator, TextFieldProps } from "react-native-ui-lib";
import { useTextStyle } from "../common/styles";
import { TextProps } from "./Text";

export function TextInput(props: TextFieldProps & TextProps): JSX.Element {
    const style = useTextStyle(props);

    return (
        <Incubator.TextField {...props} style={style}>
            {props.children}
        </Incubator.TextField>
    )
}
