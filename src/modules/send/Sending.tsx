import { NavScreen, Navigation, Route } from "../../common/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Screen } from "../../components/Screen";
import { Text } from "../../components/Text";
import { View } from "../../components/View";

interface Props {
    route: Route;
    navigation: Navigation;
}

export function Sending({ route, navigation }: Props): JSX.Element {
    const [sending, setSending] = useState<boolean>(true);

    useEffect(() => {
        setTimeout(() => setSending(false), 2000)
    }, []);

    return (
        <Screen>
            {
                sending ? (
                    <View direction="column">
                        <Text>Sending...</Text>
                        <Text>${route.params.amount}</Text>
                        <Text>to</Text>
                        <Text>{route.params.recipient}</Text>
                    </View>
                ) : (
                    <View direction="column">
                        <View direction="column">
                            <Text size="lg">Sent ✅</Text>
                            <Text size="lg">${route.params.amount}</Text>
                            <Text size="lg">to</Text>
                            <Text size="lg">{route.params.recipient}</Text>
                        </View>
                        <View direction="column" justify="end">
                            <Button.Primary
                                title="Home"
                                onPress={() => navigation.navigate(NavScreen.HOME)}
                            />
                        </View>
                    </View>
                )
            }
        </Screen>
    )
}
