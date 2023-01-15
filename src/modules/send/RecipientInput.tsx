import { FlatList, Pressable} from "react-native";
import { NavScreen, Navigation } from "../../common/navigation";
import { useState } from "react";
import { Button } from "../../components/Button";
import { StyleSheet } from "react-native";
import { Screen } from "../../components/Screen";
import { TextInput } from "../../components/TextInput";
import { Text } from "../../components/Text";
import { View } from "../../components/View";


const PLACEHOLDER_RECIPIENTS: SuggestedRecipient[] = [
    {
        id: "quack",
        address: 'a@milz.com',
    },
    {
        id: "whack",
        address: 'hey@dave.net',
    },
    {
        id: "sack",
        address: 'john@doe.mary',
    },
];

interface Props {
    navigation: Navigation;
}

export function RecipientInput({ navigation }: Props): JSX.Element {
    const [recipient, setRecipient] = useState<string | undefined>();

    //TODO validation, and error messages

    return (
        <Screen style={STYLES.screen}>
            <TextInput
                onChangeText={setRecipient}
                value={recipient}
                placeholder="a@milz.com"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus={true}
                keyboardType="email-address"
                onSubmitEditing={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT, {recipient: recipient})}
            />
            <FlatList
                data={PLACEHOLDER_RECIPIENTS}
                renderItem={({item}) => (
                    <SuggestedRecipientItem
                        recipient={item}
                        onPress={(recipient) => setRecipient(recipient?.address)}/>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={STYLES.suggestions}
            />
            <View direction="row" align="end">
                <Button.Secondary
                    title="Cancel"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
                <Button.Primary
                    title="Amount"
                    onPress={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT, {recipient: recipient})}
                />
            </View>
        </Screen>
    )
}


interface SuggestedRecipient {
    id: string;
    address: string;
}

interface SuggestedRecipientItemProps {
    recipient: SuggestedRecipient;
    onPress: (recipient: SuggestedRecipient) => void;
}

function SuggestedRecipientItem(props: SuggestedRecipientItemProps): JSX.Element {
    return (
        <Pressable onPress={() => props.onPress(props.recipient)}>
            <Text style={STYLES.suggestion}>{props.recipient.address}</Text>
        </Pressable>
    )
}


const STYLES = StyleSheet.create({
    screen: {
        gap: 24,
    },

    suggestions: {
        fontSize: 18,
        gap: 25,
        justifyContent: "center"
    },

    suggestion: {
        fontSize: 18
    }
})
