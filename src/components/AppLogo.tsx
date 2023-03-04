import { TextStyleProps } from "../common/styles";
import { Text } from "./Text";

interface Props {
    primary?: boolean;
    secondary?: boolean;
}

export function AppLogo(props: Props): JSX.Element {
    const extraProps: TextStyleProps = {
        "primary-dark": props.primary,
        "gray-light": props.secondary
    }
    return <Text xxl {...extraProps}>TAP</Text>
}
