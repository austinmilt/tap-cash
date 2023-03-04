import { ButtonProps, Button as RNUIButton } from "react-native-ui-lib"
import { COLORS } from "../common/styles";
import { useMemo } from "react";

interface Props {
    label: string;
    onPress: () => void;
    primary?: boolean;
    secondary?: boolean;
    disabled?: boolean;
}

export function Button(props: Props & ButtonProps): JSX.Element {
    return (
        <RNUIButton
            color={props.primary ? COLORS.grayLight : COLORS.primaryMedium}
            backgroundColor={props.primary ? COLORS.primaryMedium : COLORS.grayLight}
            labelStyle={{ fontSize: 18 }}
            borderRadius={5}
            size="large"
            {...props}
        />
    )
}
