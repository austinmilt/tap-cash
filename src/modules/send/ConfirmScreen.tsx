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
                <View flex center gap-md>
                    <Text text-md gray-dark>
                        You're sending
                        <Text bold text-md gray-dark>
                            {formatUsd(finalAmount)}
                        </Text> to {recipient}.
                    </Text>
                    {(needsDeposit) && (
                        <Text text-md gray-dark>
                            {formatUsd(finalDepositAmount)} will be charged
                            to card ending in {paymentMethod?.creditCard?.lastFourDigits}
                            to bring your account up to balance.
                        </Text>
                    )}
                    <Button
                        primary
                        label="Confirm"
                        onPress={() => props.navigation.navigate(SendNavScreen.SENDING, props.route.params)}
                    />
                </View>
            )}
        </Screen>
    )
}
