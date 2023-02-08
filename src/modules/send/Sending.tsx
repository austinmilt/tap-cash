import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { COLORS } from "../../common/styles";

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
                    <View flex center gap={20}>
                        <Text size="lg">Sending...</Text>
                        <Text size="xl" color={COLORS.primaryLight}>${props.amount}</Text>
                        <Text size="lg">to</Text>
                        <Text size="xl" color={COLORS.primaryLight}>{props.recipient}</Text>
                    </View>
                ) : (
                    <View flex center>
                        <View flex center gap={20}>
                            <Text size="lg">Sent ✅</Text>
                            <Text size="xl" color={COLORS.primaryLight}>${props.amount}</Text>
                            <Text size="lg">to</Text>
                            <Text size="xl" color={COLORS.primaryLight}>{props.recipient}</Text>
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
