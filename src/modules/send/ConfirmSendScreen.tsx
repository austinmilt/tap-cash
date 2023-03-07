import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.CONFIRM>;

export function ConfirmSendScreen(props: Props): JSX.Element {
    return (
        <View center>
            <View flex center gap-md>
                <Text lg>You're about to send</Text>
                <Text xl primary-light>${props.route.params.amount}</Text>
                <Text lg>to</Text>
                <Text xl primary-light>{props.route.params.recipient}</Text>
                <Text md>and they're gonna be so happy about it.</Text>
            </View>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap-sm>
                <Button
                    secondary
                    label="Cancel"
                    onPress={props.navigation.pop}
                />
                <Button
                    primary
                    label="Confirm"
                    onPress={() => props.navigation.navigate(SendNavScreen.SENDING, props.route.params)}
                />
            </View>
        </View>
    )
}
