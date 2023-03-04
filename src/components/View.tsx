import { View as RNUIView, ViewProps } from "react-native-ui-lib";
import { ViewStyleProps, useViewStyle } from "../common/styles";

export function View(props: ViewProps & ViewStyleProps): JSX.Element {
    const style = useViewStyle(props);

    return (
        <RNUIView flexG style={style} {...props}>
            {props.children}
        </RNUIView>
    );
}
