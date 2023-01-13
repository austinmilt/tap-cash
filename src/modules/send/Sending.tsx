import { Button, Text, View } from "react-native";
import { NavScreen } from "../../common/navigation";
import { useEffect, useState } from "react";

export function Sending({ navigation }): JSX.Element {
    const [sending, setSending] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => setSending(false), 2000)
    }, []);

    return (
        <View>
            {
                sending ?
                    <Text>Sending...</Text> :
                    <View>
                        <Text>Sent!</Text>
                        <Button
                            title="Go back to home"
                            onPress={() => navigation.navigate(NavScreen.HOME)}
                        />
                    </View>
            }
        </View>
    )
}
