import { Button, Text, View } from "react-native";
import { NavScreen } from "../../common/navigation";
import { useEffect, useState } from "react";

export function Sending({ route, navigation }): JSX.Element {
    const [sending, setSending] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => setSending(false), 2000)
    }, []);

    return (
        <View>
            {
                sending ? (
                    <View>
                        <Text>Sending...</Text>
                        <Text>${route.params.amount}</Text>
                        <Text>to</Text>
                        <Text>{route.params.recipient}</Text>
                    </View>
                ) : (
                    <View>
                        <Text>Sent ✅</Text>
                        <Text>${route.params.amount}</Text>
                        <Text>to</Text>
                        <Text>{route.params.recipient}</Text>
                        <Button
                            title="Home"
                            onPress={() => navigation.navigate(NavScreen.HOME)}
                        />
                    </View>
                )
            }
        </View>
    )
}
