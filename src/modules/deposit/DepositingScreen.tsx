import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { DepositNavScreen, DepositStackRouteParams, TopNavScreen } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDeposit } from "../../api/client";
import { useEffect } from "react";
import { useUserProfile } from "../../components/profile-provider";
import { Screen } from "../../components/Screen";
import { formatUsd } from "../../common/number";
import { StyleSheet } from "react-native";
import { TransactionStatus } from "../../components/TransactionStatus";
import { BigDollars } from "../../components/BigBalance";

type Props = NativeStackScreenProps<DepositStackRouteParams, DepositNavScreen.DEPOSITING>;

export function DepositingScreen(props: Props): JSX.Element {
    const { amount } = props.route.params;
    const userProfileContext = useUserProfile();
    const depositContext = useDeposit();

    // TODO double, triple quadruple check this can only run once
    useEffect(() => {
        if (userProfileContext.email == null) {
            //TODO show some error state
            console.error("missing user email");
            return;
        } else if (userProfileContext.wallet == null) {
            //TODO show some error state
            console.error("missing user wallet");
            return;
        }
        depositContext.submit({
            email: userProfileContext.email,
            amount: amount
        });
    }, []);

    return (
        <Screen spread padding-md>
            <View flexG center gap-sm>
                <BigDollars>{amount}</BigDollars>
                <View>
                    <TransactionStatus
                        {...depositContext}
                        success={!depositContext.loading && (depositContext.error == null)}
                        defaultContent={
                            <Text text-md gray-medium>
                                loading
                            </Text>
                        }
                        loadingContent={
                            <Text text-md gray-dark>
                                depositing {formatUsd(amount)} to your account
                            </Text>
                        }
                        errorContent={
                            <Text text-md error>
                                failed to deposit {formatUsd(amount)} to your account
                            </Text>
                        }
                        successContent={
                            <Text text-md gray-dark>
                                deposited {formatUsd(amount)} to your account
                            </Text>
                        }
                    />
                </View>
            </View>
            <Button
                tertiary
                label="Done"
                disabled={depositContext.loading}
                onPress={() => props.navigation.getParent()?.navigate(TopNavScreen.HOME)}
            />
        </Screen>
    )
}


const STYLES = StyleSheet.create({
    amount: {
        fontSize: 53,
    },
})
