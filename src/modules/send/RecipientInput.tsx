import { FlatList, Pressable} from "react-native";
import { useCallback, useState } from "react";
import { Button } from "../../components/Button";
import { StyleSheet } from "react-native";
import { TextInput } from "../../components/TextInput";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { COLORS } from "../../common/styles";


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
    onCompleted: (recipient: string) => void;
    onCancel: () => void;
}

export function RecipientInput(props: Props): JSX.Element {
    const [recipient, setRecipient] = useState<string | undefined>();

    //TODO validation, and error messages

    const onSubmit = useCallback(() => {
        if (recipient === undefined) {
            //TODO improve with error message instead of throw
            throw new Error("Must fill out recipient.");
        }
        props.onCompleted(recipient);
    }, [props.onCompleted, recipient]);

    return (
        <View center flexG>
            <View flex flexG padding-30 width="100%" gap={30}>
                <TextInput
                    onChangeText={setRecipient}
                    value={recipient}
                    placeholder="a@milz.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onSubmitEditing={onSubmit}
                    autoFocus
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
            </View>
            <View flex flexS row centerH bottom spread paddingH-30 width="80%" gap={10}>
                <Button.Secondary
                    title="Cancel"
                    onPress={props.onCancel}
                />
                <Button.Primary
                    title="Confirm"
                    onPress={onSubmit}
                />
            </View>
        </View>
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
        justifyContent: "center",
    },

    suggestion: {
        fontSize: 18,
        color: COLORS.secondaryLight
    }
})
