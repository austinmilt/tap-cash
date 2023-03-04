import { ButtonProps, Button as RNUIButton } from "react-native-ui-lib"
import { COLORS } from "../common/styles";

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
            color={props.primary ? COLORS.primaryDark : COLORS.primaryLight}
            backgroundColor={props.primary ? COLORS.grayLight : COLORS.grayDark}
            labelStyle={{ fontWeight: "900", fontSize: 21 }}
            borderRadius={5}
            size="large"
            {...props}
        />
    );
}
