import { ButtonProps, Button as RNUIButton } from "react-native-ui-lib"
import { COLORS, useTextStyle } from "../common/styles";
import { useMemo } from "react";

interface Props {
    label: string;
    onPress: () => void;
    primary?: boolean;
    secondary?: boolean;
    disabled?: boolean;
}

export function Button(props: Props & ButtonProps): JSX.Element {
    const labelStyle = useTextStyle({
        "text-md": true,
        "gray-light": true
    });

    return (
        <RNUIButton
            color={props.primary ? COLORS.grayLight : COLORS.secondaryMedium}
            backgroundColor={props.primary ? COLORS.primaryMedium : COLORS.secondaryMedium}
            labelStyle={labelStyle}
            borderRadius={5}
            size="large"
            {...props}
        />
    )
}
