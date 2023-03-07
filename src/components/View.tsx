import { View as RNUIView, ViewProps } from "react-native-ui-lib";
import { ViewStyleProps, useViewStyle } from "../common/styles";

export function View(props: ViewProps & ViewStyleProps): JSX.Element {
    const style = useViewStyle(props);

    if (!props.flex && !props.flexG && !props.flexS) {
        props.flexG = true;
    }

    return (
        <RNUIView {...props} style={[style, props.style]} >
            {props.children}
        </RNUIView >
    );
}
