import { useCallback, useState } from "react";
import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextInput } from "../components/TextInput";
import { View } from "../components/View";
import { useHelloWorld, useListChannels } from "../api/client";
import { Text } from "../components/Text";

interface Props {
    navigation: Navigation;
}

export function Home({ navigation }: Props): JSX.Element {
    return (
        <Screen>
            <View direction="row" align="end">
                <Button.Primary
                    title="Profile"
                    onPress={() => navigation.navigate(NavScreen.PROFILE)}
                />
                <Button.Primary
                    title="Send"
                    onPress={() => navigation.navigate(NavScreen.SEND)}
                />
            </View>
            <SayHello/>
            <ListChannels/>
        </Screen>
    )
}


//TODO remove example showing how to integrate with the backend
function SayHello(): JSX.Element {
    const [name, setName] = useState<string | undefined>();
    const queryContext = useHelloWorld();

    const onSubmit: () => void = useCallback(() => {
        if (name != null) queryContext.submit(name)
    }, [name, queryContext.submit]);

    return (
        <View direction="column">
            <TextInput
                onChangeText={setName}
                value={name}
                placeholder="Dave"
                autoCapitalize="none"
                keyboardType="default"
                onSubmitEditing={onSubmit}
            />
            <Button.Primary title={queryContext.loading ? "Saying hello..." : "Say Hello"} onPress={onSubmit}/>
            {
                !queryContext.loading && (queryContext.data != null) && (
                    <Text>{queryContext.data}</Text>
                )
            }
        </View>
    )
}


//TODO remove example showing how to integrate with the backend
function ListChannels(): JSX.Element {
    const queryContext = useListChannels();

    return (
        <View direction="column">
            <Button.Primary title={queryContext.loading ? "Loading..." : "Channels"} onPress={queryContext.submit}/>
            {
                !queryContext.loading && (queryContext.data != null) && (
                    <Text>{queryContext.data}</Text>
                )
            }
        </View>
    )
}
