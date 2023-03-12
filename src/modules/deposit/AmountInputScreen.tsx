import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DepositNavScreen, DepositStackRouteParams } from "../../common/navigation";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import { COLORS } from "../../common/styles";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { MAX_TX_AMOUNT } from "../../common/constants";
import { DollarInput } from "../../components/DollarInput";

type Props = NativeStackScreenProps<DepositStackRouteParams, DepositNavScreen.AMOUNT_INPUT>;

export function AmountInputScreen(props: Props): JSX.Element {
    const [amount, setAmount] = useState<number | undefined>();

    const onSubmit = useCallback(() => {
        props.navigation.navigate(DepositNavScreen.DEPOSITING, { amount: (amount ?? 0) });
    }, [props.navigation.navigate, amount]);

    return (
        <Screen padding-md spread style={{ paddingBottom: 66 }}>
            <View center flexG>
                <DollarInput
                    onSubmit={onSubmit}
                    maxValue={MAX_TX_AMOUNT}
                    onValueChange={setAmount}
                />
                <Text text-md gray-dark>
                    deposit to your Tap account
                </Text>
                {/* TODO Replace dummy CC */}
                <Text text-md gray-dark>{`from: •••• •••• •••• 4567`}</Text>
            </View>
            <Button secondary label="Confirm" onPress={onSubmit} />
        </Screen>
    )
}
