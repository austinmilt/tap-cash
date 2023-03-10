import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DepositNavScreen, DepositStackRouteParams } from "../../common/navigation";
import { Screen } from "../../components/Screen";
import { Button } from "../../components/Button";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { COLORS } from "../../common/styles";
import { NumberInput } from "react-native-ui-lib";
import { View } from "../../components/View";
import { Text } from "../../components/Text";
import { MAX_TX_AMOUNT } from "../../common/constants";
import { formatUsd } from "../../common/number";

type Props = NativeStackScreenProps<DepositStackRouteParams, DepositNavScreen.AMOUNT_INPUT>;

export function AmountInputScreen(props: Props): JSX.Element {
    const [amount, setAmount] = useState<number | undefined>();
    const [error, setError] = useState<string | undefined>();

    // clear errors when the user changes the amount since
    // it may be valid again
    useEffect(() => {
        setError(undefined);
    }, [amount]);

    const handleValueChange = (newValue: number) => {
        if (newValue <= MAX_TX_AMOUNT) {
            setAmount(newValue);
        }
        else {
            setAmount(9999.99);
        }
    };
    const onSubmit = useCallback(() => {
        if ((amount == null) || (amount <= 0)) {
            setError("Please enter a positive amount.");
            return;
        }
        if (amount > MAX_TX_AMOUNT) {
            setError(`Unable to deposit more than ${formatUsd(MAX_TX_AMOUNT)}!`);
            return;
        }
        props.navigation.navigate(DepositNavScreen.DEPOSITING, { amount: amount });
    }, [props.navigation.navigate, amount]);

    return (
        <Screen padding-md spread style={{ paddingBottom: 66 }}>
            <View center flexG>
                {/* @ts-ignore this component's type validation is fucked up */}
                <NumberInput
                    onChangeNumber={(v: { number: number }) => handleValueChange(v.number)}
                    onSubmitEditing={onSubmit}
                    leadingText="$"
                    fractionDigits={2}
                    style={STYLES.text}
                    leadingTextStyle={STYLES.leadingText}
                    placeholder={"0"}
                    centered
                    autoFocus
                    maxLength={7}
                // TODO ADD value here
                />
                <Text text-md gray-dark>
                    deposited to your Tap account
                </Text>
            </View>
            {error && (
                <View flexG center gap-sm>
                    <Text text-lg gray-dark center>Try again</Text>
                    <Text text-md gray-medium center error>{error}</Text>
                </View>
            )}
            <Button secondary label="Confirm" onPress={onSubmit} />
        </Screen>
    )
}



const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
        color: COLORS.grayDark,
        fontFamily: "Jost-Bold"
    },

    leadingText: {
        fontSize: 40,
        color: COLORS.grayDark,
        fontFamily: "Jost-Bold",
        marginRight: 5,
        alignSelf: "flex-start"
    }
})
