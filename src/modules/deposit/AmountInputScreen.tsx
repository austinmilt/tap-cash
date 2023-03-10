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
        props.navigation.navigate(DepositNavScreen.DEPOSITING, { amount: amount });
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
                <View style={styles.iconWrapper}>
                </View>
                {/* TODO Replace dummy CC */}
                <View >
                    <Text text-md gray-dark>{`from: •••• •••• •••• 4567`}</Text>
                </View>
            </View>
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


const styles = StyleSheet.create({
    iconWrapper: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    }
});
