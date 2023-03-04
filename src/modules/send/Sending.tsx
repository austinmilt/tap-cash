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
                    <View flex center gap-md>
                        <Text lg>Sending...</Text>
                        <Text xl primary-light>${props.amount}</Text>
                        <Text lg>to</Text>
                        <Text xl primary-light>{props.recipient}</Text>
                    </View>
                ) : (
                    <View flex center>
                        <View flex center gap-md>
                            <Text lg>Sent ✅</Text>
                            <Text xl primary-light>${props.amount}</Text>
                            <Text lg>to</Text>
                            <Text xl primary-light>{props.recipient}</Text>
                        </View>
                        <View flex bottom>
                            <Button
                                primary
                                label="Home"
                                onPress={props.onClose}
                            />
                        </View>
                    </View>
                )
            }
        </View>
    )
}
