import { Avatar, ViewProps } from "react-native-ui-lib";
import { View } from "./View";
import { MemberPublicProfile } from "../shared/member";
import { StyleSheet } from "react-native";
import { Text } from "./Text";
import { ViewStyleProps } from "../common/styles";


export function RecipientProfile(props: MemberPublicProfile & ViewProps & ViewStyleProps): JSX.Element {
    return (
        <View centerV left row style={[STYLES.container, props.style]} {...props}>
            <Avatar
                source={{ uri: props.profile }}
                size={48}
            />
            <View left centerV>
                <Text text-md gray-dark>{props.name}</Text>
                <Text gray-medium style={STYLES.email}>{props.email}</Text>
            </View>
        </View>
    );
}


const STYLES = StyleSheet.create({
    container: {
        paddingVertical: 12,
        gap: 16,
    },

    email: {
        fontSize: 14
    }
})
