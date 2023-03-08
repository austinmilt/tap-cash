import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { View } from "../../components/View";
import { NumberInput } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { COLORS, TextStyleProps } from "../../common/styles";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "../../components/Text";
import { Screen } from "../../components/Screen";
import { useUserProfile } from "../../components/profile-provider";
import { formatUsd } from "../../common/number";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.AMOUNT_INPUT>;

export function AmountInputScreen(props: Props): JSX.Element {
    const [amount, setAmount] = useState<number>(0);
    const userProfileContext = useUserProfile();
    const accountBalance: number = useMemo(() => (
        userProfileContext.usdcBalance ?? 0
    ), [userProfileContext.usdcBalance]);

    useEffect(() => {
        userProfileContext.syncUsdcBalance();
    }, [userProfileContext.email]);

    const onSubmit = useCallback(() => {
        //TODO other validation?
        const depositAmount: number = Math.max(0, amount - accountBalance);
        props.navigation.navigate(
            SendNavScreen.CONFIRM,
            {
                ...props.route.params,
                amount: amount,
                depositAmount: depositAmount
            }
        );
    }, [props.navigation.navigate, amount, accountBalance]);

    const insufficientBalance: boolean = accountBalance < amount;
    const textColorStyle: TextStyleProps = insufficientBalance ? {
        "error": true
    } : {
        "gray-dark": true
    };
    const buttonLabel: string = insufficientBalance ? "Deposit funds & Send" : "Send";

    return (
        <Screen spread padding-md>
            <View gap-md top left row flexS>
                <Text gray-medium text-md>To</Text>
                <Text gray-medium text-md bold>{props.route.params.recipient}</Text>
            </View>
            <View centerV gap-sm flexG>
                {/* @ts-ignore this component's type validation is fucked up*/}
                <NumberInput
                    onChangeNumber={(v: { number: number }) => setAmount(v.number)}
                    onSubmitEditing={onSubmit}
                    leadingText="$"
                    fractionDigits={2}
                    style={STYLES.text}
                    leadingTextStyle={STYLES.leadingText}
                    centered
                    autoFocus
                />
                <Text center text-md {...textColorStyle}>
                    Balance: {formatUsd(accountBalance)}
                </Text>
            </View>
            <Button primary label={buttonLabel} onPress={onSubmit} />
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
