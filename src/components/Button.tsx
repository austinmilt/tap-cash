import AwesomeButton from "react-native-really-awesome-button";
import { COLORS } from "../common/styles";

interface Props {
    title: string;
    onPress: () => void;
}

export function Button(): void {
    throw new Error("Use one of the composed button types.");
}


// https://www.npmjs.com/package/react-native-really-awesome-button
function PrimaryButton(props: Props): JSX.Element {
    return (
        <AwesomeButton
            onPress={props.onPress}
            textColor={COLORS.secondaryDark}
            backgroundColor={COLORS.secondaryLight}
        >
            {props.title}
        </AwesomeButton>
    )
}
Button.Primary = PrimaryButton;


function SecondaryButton(props: Props): JSX.Element {
    return (
        <AwesomeButton
            onPress={props.onPress}
            textColor={COLORS.primaryMedium}
            backgroundColor={COLORS.primaryLight}
        >
            {props.title}
        </AwesomeButton>
    )
}
Button.Secondary = SecondaryButton;
