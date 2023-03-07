import { FlatList, Pressable } from "react-native";
import { useCallback, useMemo } from "react";
import { Button } from "../../components/Button";
import { StyleSheet } from "react-native";
import { TextInput } from "../../components/TextInput";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { useQueryRecipients } from "../../api/client";
import React from "react";
import { useStateWithDebounce } from "../../common/debounce";
import { EmailAddress, MemberPublicProfile } from "../../shared/member";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useUserProfile } from "../../components/profile-provider";


type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.RECIPIENT_INPUT>;


export function RecipientInputScreen(props: Props): JSX.Element {
    const userProfileContext = useUserProfile();
    const recipientQueryContext = useQueryRecipients();
    const [recipient, setRecipient] = useStateWithDebounce<EmailAddress | undefined>(query => {
        if (query !== undefined) {
            recipientQueryContext.submit({ emailQuery: query, limit: 10 });
        }
    }, 250);

    const allowedRecipients: MemberPublicProfile[] = useMemo(() => {
        const members = recipientQueryContext.data;
        if (members == null) return [];
        return members.filter(m => m.email !== userProfileContext.email);
    }, [recipientQueryContext.data, userProfileContext.email]);

    const onSubmit = useCallback(() => {
        //TODO replace with correct UI
        if (recipient === undefined) {
            throw new Error("Must provide a recipient.");
        }
        if (userProfileContext.email === recipient) {
            throw new Error("Cannot send to yourself.");
        }
        if ((allowedRecipients.find(m => m.email === recipient) == null)) {
            throw new Error(`${recipient} is not a member of Tap Cash`);
        }
        props.navigation.navigate(SendNavScreen.AMOUNT_INPUT, { recipient: recipient });
    }, [recipient, allowedRecipients, props.navigation]);

    return (
        <View center flexG>
            <View flex flexG padding-30 width="100%" gap-lg>
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
            <View flex flexS row centerH bottom spread paddingH-30 width="80%" gap-sm>
                <Button
                    label="Cancel"
                    onPress={props.navigation.pop}
                    secondary
                />
                <Button
                    label="Confirm"
                    onPress={onSubmit}
                    primary
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
        color: "green"
    }
})
