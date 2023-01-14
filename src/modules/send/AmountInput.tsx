import { Button, TextInput, View } from "react-native";
import { NavScreen } from "../../common/navigation";
import { useState } from "react";

export function AmountInput({ route, navigation }): JSX.Element {
    const [amountString, setAmountString] = useState<string | undefined>();

    //TODO validation and error messages

    return (
        <View>
            <TextInput
                onChangeText={setAmountString}
                value={amountString}
                autoCapitalize="none"
                autoFocus={true}
                keyboardType="decimal-pad"
                onSubmitEditing={() => navigation.navigate(
                    NavScreen.SEND_CONFIRM,
                    {
                        ...route.params,
                        amount: Number.parseFloat(amountString ?? '0')
                    }
                )}
            />
            <Button
                title="Cancel"
                onPress={() => navigation.navigate(NavScreen.SEND_RECIPIENT_INPUT)}
            />
        </View>
    )
}
