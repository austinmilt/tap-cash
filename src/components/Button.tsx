import { ButtonProps, Button as RNUIButton } from "react-native-ui-lib"
import { COLORS, useTextStyle } from "../common/styles";
import { useMemo } from "react";

interface Props {
    label: string;
    onPress: () => void;
    primary?: boolean;
    secondary?: boolean;
    tertiary?: boolean;
    disabled?: boolean;
}

export function Button(props: Props & ButtonProps): JSX.Element {
    const [fontColor, bgColor, borderColor]: [string, string, string | undefined] = useMemo(() => {
        if (props.secondary) return [COLORS.whiteish, COLORS.secondaryMedium, undefined];
        if (props.tertiary) return [COLORS.grayDark, COLORS.whiteish, COLORS.grayLight];
        else return [COLORS.whiteish, COLORS.primaryMedium, undefined];
    }, [props.secondary, props.tertiary, props.primary]);

    const labelStyle = {
        ...useTextStyle({
            "text-md": true,
        }),
        color: fontColor
    };

    return (
        <RNUIButton
            color={fontColor}
            backgroundColor={bgColor}
            outlineColor={borderColor}
            labelStyle={labelStyle}
            borderRadius={5}
            style={{ height: 48 }}
            {...props}
        />
    )
}
