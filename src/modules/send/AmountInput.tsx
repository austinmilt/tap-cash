import { TextInput, View } from "react-native";
import { NavScreen, Navigation, Route } from "../../common/navigation";
import { useState } from "react";
import { Button } from "../../components/Button";

interface Props {
    route: Route;
    navigation: Navigation;
}

export function AmountInput({ route, navigation }: Props): JSX.Element {
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
            <Button.Secondary
                title="Cancel"
                onPress={() => navigation.navigate(NavScreen.SEND_RECIPIENT_INPUT)}
            />
        </View>
    )
}
