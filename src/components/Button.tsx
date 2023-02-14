import { StyleProp, ViewStyle } from "react-native/types";
import { Button as RNUIButton } from "react-native-ui-lib"
import { COLORS } from "../common/styles";

interface Props {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

export function Button(): void {
    throw new Error("Use one of the composed button types.");
}


// https://www.npmjs.com/package/react-native-really-awesome-button
function PrimaryButton(props: Props): JSX.Element {
    return (
        <RNUIButton
            onPress={props.onPress}
            color={COLORS.primaryDark}
            backgroundColor={COLORS.primaryLight}
            style={props.style}
            label={props.title}
            labelStyle={{fontWeight: "900", fontSize: 21}}
            borderRadius={5}
            size="large"
        />
    )
}
Button.Primary = PrimaryButton;


function SecondaryButton(props: Props): JSX.Element {
    return (
        <RNUIButton
            onPress={props.onPress}
            color={COLORS.secondaryDark}
            backgroundColor={COLORS.secondaryLight}
            style={props.style}
            label={props.title}
            labelStyle={{fontWeight: "900", fontSize: 21}}
            borderRadius={5}
            size="large"
        />
    )
}
Button.Secondary = SecondaryButton;
