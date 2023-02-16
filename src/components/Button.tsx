import { StyleProp, ViewStyle } from "react-native/types";
import { Button as RNUIButton } from "react-native-ui-lib"
import { COLORS } from "../common/styles";

interface Props {
    title: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
}

export function Button(): void {
    throw new Error("Use one of the composed button types.");
}


const PRIMARY_ENABLED_TEXT_COLOR: string = COLORS.primaryDark;
const PRIMARY_DISABLED_TEXT_COLOR: string = COLORS.primaryDarkDeemphasized;
const PRIMARY_ENABLED_BACKGROUND_COLOR: string = COLORS.primaryLight;
const PRIMARY_DISABLED_BACKGROUND_COLOR: string = COLORS.primaryLightDeemphasized;


function PrimaryButton(props: Props): JSX.Element {
    return (
        <RNUIButton
            onPress={props.onPress}
            color={props.disabled ? COLORS.primaryDarkDeemphasized : COLORS.primaryDark}
            backgroundColor={props.disabled ? COLORS.primaryLightDeemphasized : COLORS.primaryLight}
            style={props.style}
            label={props.title}
            labelStyle={{ fontWeight: "900", fontSize: 21 }}
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
            labelStyle={{ fontWeight: "900", fontSize: 21 }}
            borderRadius={5}
            size="large"
        />
    )
}
Button.Secondary = SecondaryButton;
