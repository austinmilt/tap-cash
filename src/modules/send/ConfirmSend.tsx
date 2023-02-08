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
            <View flex center>
                <Text size="lg">You're about to send</Text>
                <Text size="lg">${props.amount}</Text>
                <Text size="lg">to</Text>
                <Text size="lg">{props.recipient}</Text>
                <Text size="sm">and they're gonna be so happy about it.</Text>
            </View>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap={10}>
                <Button.Secondary
                    title="Cancel"
                    onPress={props.onCancel}
                />
                <Button.Primary
                    title="Confirm"
                    onPress={props.onCompleted}
                />
            </View>
        </View>
    )
}
