import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";

interface Props {
    recipient: string;
    amount: number;
    onCompleted: () => void;
    onCancel: () => void;
}


export function ConfirmSend(props: Props): JSX.Element {
    return (
        <View center>
            <View flex center gap-md>
                <Text lg>You're about to send</Text>
                <Text xl primary-light>${props.amount}</Text>
                <Text lg>to</Text>
                <Text xl primary-light>{props.recipient}</Text>
                <Text md>and they're gonna be so happy about it.</Text>
            </View>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap-sm>
                <Button
                    secondary
                    label="Cancel"
                    onPress={props.onCancel}
                />
                <Button
                    primary
                    label="Confirm"
                    onPress={props.onCompleted}
                />
            </View>
        </View>
    )
}
