import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";

interface Props {
    recipient: string;
    amount: number;
    onClose: () => void;
}

export function Sending(props: Props): JSX.Element {
    const [sending, setSending] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => setSending(false), 2000)
    }, []);

    return (
        <View>
            {
                sending ? (
                    <View flex center>
                        <Text>Sending...</Text>
                        <Text>${props.amount}</Text>
                        <Text>to</Text>
                        <Text>{props.recipient}</Text>
                    </View>
                ) : (
                    <View flex center>
                        <View flex center>
                            <Text size="lg">Sent ✅</Text>
                            <Text size="lg">${props.amount}</Text>
                            <Text size="lg">to</Text>
                            <Text size="lg">{props.recipient}</Text>
                        </View>
                        <View flex bottom>
                            <Button.Primary
                                title="Home"
                                onPress={props.onClose}
                            />
                        </View>
                    </View>
                )
            }
        </View>
    )
}
