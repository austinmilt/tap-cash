import { TextProps as RNUITextProps } from "react-native";
import { TextStyleProps, useTextStyle } from "../common/styles";
import { Text as RNUIText } from "react-native-ui-lib";

export type TextProps = RNUITextProps & TextStyleProps;

export function Text(props: TextProps): JSX.Element {
    const style = useTextStyle(props);

    return (
        <RNUIText style={style} {...props}>
            {props.children}
        </RNUIText>
    )
}
