import { useMemo } from "react";
import { TextStyleProps } from "../common/styles";
import { Text } from "./Text";

interface Props {
    primary?: boolean;
    secondary?: boolean;
}

export function AppLogo(props: Props): JSX.Element {
    const extraProps = useMemo(() => {
        const textProps: TextStyleProps = {};
        if (props.primary) textProps["primary-medium"] = true;
        if (props.secondary) textProps["gray-light"] = true;
        return textProps;
    }, [props]);

    return <Text extra-bold style={{ fontSize: 80 }} {...extraProps}>tap</Text>
}
