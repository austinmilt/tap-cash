import { FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { NavScreen, Navigation } from "../../common/navigation";
import { useState } from "react";
import { Button } from "../../components/Button";
import { StyleSheet } from "react-native";


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

    //TODO validation, suggested recipients, and error messages

    return (
        <SafeAreaView style={STYLES.screen}>
            <TextInput
                onChangeText={setRecipient}
                value={recipient}
                placeholder="a@milz.com"
                autoCapitalize="none"
                autoComplete="email"
                autoFocus={true}
                keyboardType="email-address"
                onSubmitEditing={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT, {recipient: recipient})}
                style={STYLES.input}
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
            <View style={STYLES.buttonView}>
                <Button.Secondary
                    title="Cancel"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
                <Button.Primary
                    title="Amount"
                    onPress={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT, {recipient: recipient})}
                />
            </View>
        </SafeAreaView>
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
        gap: 24
    },

    buttonView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%"
    },

    input: {
        fontSize: 24,
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
