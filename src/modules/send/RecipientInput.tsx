import { Button, FlatList, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { NavScreen } from "../../common/navigation";
import { useState } from "react";


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

export function RecipientInput({ navigation }): JSX.Element {
    const [recipient, setRecipient] = useState<string | undefined>();

    //TODO validation, suggested recipients, and error messages

    return (
        <SafeAreaView>
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
            />
            <Button
                title="Amount"
                onPress={() => navigation.navigate(NavScreen.SEND_AMOUNT_INPUT, {recipient: recipient})}
            />
            <Button
                title="Cancel"
                onPress={() => navigation.navigate(NavScreen.HOME)}
            />
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
        <View>
            <Pressable onPress={() => props.onPress(props.recipient)}>
                <Text>{props.recipient.address}</Text>
            </Pressable>
        </View>
    )
}
