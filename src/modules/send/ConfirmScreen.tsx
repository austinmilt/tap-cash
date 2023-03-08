import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { formatUsd } from "../../common/number";
import { useSavedPaymentMethods } from "../../api/client";
import { useEffect, useMemo } from "react";
import { useUserProfile } from "../../components/profile-provider";
import { PaymentMethodSummary } from "../../shared/payment";
import { Loading } from "../../components/Loading";
import { Screen } from "../../components/Screen";
import { StyleSheet } from "react-native";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.CONFIRM>;

export function ConfirmScreen(props: Props): JSX.Element {
    const userProfileContext = useUserProfile();
    const { recipient, amount, depositAmount } = props.route.params;
    // round to the nearest cent
    const finalAmount: number = Math.round(amount * 100) / 100;
    const finalDepositAmount: number = Math.round(depositAmount * 100) / 100;
    const paymentMethodsContext = useSavedPaymentMethods();
    const needsDeposit: boolean = depositAmount > 0;

    // get a credit card to charge if the user doesnt have enough money
    useEffect(() => {
        if (needsDeposit && (userProfileContext.email != null)) {
            paymentMethodsContext.submit({ memberEmail: userProfileContext.email });
        }
    }, [depositAmount, userProfileContext.email]);

    const paymentMethod: PaymentMethodSummary | undefined = useMemo(() => {
        let result: PaymentMethodSummary | undefined;
        if ((paymentMethodsContext.data != null) && (paymentMethodsContext.data.length > 0)) {
            result = paymentMethodsContext.data[0];
        }
        return result;
    }, [paymentMethodsContext.data]);

    const loading: boolean = needsDeposit && (paymentMethodsContext.loading || (paymentMethodsContext.data == null));

    return (
        <Screen>
            {loading && <Loading />}
            {!loading && (
                <View flexG padding-md style={{ paddingBottom: 66 }}>
                    <View flexG center gap-sm>
                        <Text gray-dark bold style={STYLES.text}>{formatUsd(finalAmount)}</Text>
                        <Text gray-dark text-lg>Send to {recipient}?</Text>
                        {(needsDeposit) && (
                            <View>
                                <Text text-md gray-dark>{formatUsd(finalAmount - finalDepositAmount)} from your account</Text>
                                <Text text-md gray-dark>{formatUsd(finalDepositAmount)} charged to card ending in {paymentMethod?.creditCard?.lastFourDigits}</Text>
                            </View>
                        )}
                    </View>
                    <Button
                        secondary
                        label="Confirm"
                        onPress={() => props.navigation.navigate(SendNavScreen.SENDING, props.route.params)}
                    />
                </View>
            )}
        </Screen >
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
    },

    leadingText: {
        fontSize: 40,
        marginRight: 5,
        alignSelf: "flex-start"
    }
})
