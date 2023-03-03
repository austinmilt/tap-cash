import { FlatList, Pressable } from "react-native";
import { useCallback } from "react";
import { Button } from "../../components/Button";
import { StyleSheet } from "react-native";
import { TextInput } from "../../components/TextInput";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { COLORS } from "../../common/styles";
import { useQueryRecipients } from "../../api/client";
import React from "react";
import { useStateWithDebounce } from "../../common/debounce";
import { EmailAddress, MemberPublicProfile } from "../../shared/member";


interface Props {
    onCompleted: (recipient: string) => void;
    onCancel: () => void;
}

export function RecipientInput(props: Props): JSX.Element {
    const recipientQueryContext = useQueryRecipients();
    const [recipient, setRecipient] = useStateWithDebounce<EmailAddress | undefined>(query => {
        if (query !== undefined) {
            recipientQueryContext.submit({ emailQuery: query, limit: 10 });
        }
    }, 250);

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
                    data={recipientQueryContext.data}
                    renderItem={({ item }) => (
                        <MemberPublicProfileItem
                            recipient={item}
                            onPress={(recipient) => setRecipient(recipient?.email)} />
                    )}
                    keyExtractor={item => item.email}
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

interface MemberPublicProfileItemProps {
    recipient: MemberPublicProfile;
    onPress: (recipient: MemberPublicProfile) => void;
}

function MemberPublicProfileItem(props: MemberPublicProfileItemProps): JSX.Element {
    return (
        <Pressable onPress={() => props.onPress(props.recipient)}>
            <Text style={STYLES.suggestion}>{props.recipient.email}</Text>
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
