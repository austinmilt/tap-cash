import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { SendNavScreen, SendStackRouteParams, TopNavScreen } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDepositAndSend } from "../../api/client";
import { useEffect, useMemo } from "react";
import { useUserProfile } from "../../components/profile-provider";
import { Screen } from "../../components/Screen";
import { formatUsd } from "../../common/number";
import { StyleSheet } from "react-native";
import { Badge } from "react-native-ui-lib";
import { COLORS } from "../../common/styles";
import { RecipientProfile } from "../../components/RecipientProfile";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.SENDING>;

export function SendingScreen(props: Props): JSX.Element {
    const { recipient, amount, depositAmount } = props.route.params;
    const userProfileContext = useUserProfile();
    const depositAndSendContext = useDepositAndSend();
    const needsDeposit: boolean = depositAmount > 0;
    const loading: boolean = depositAndSendContext.deposit.loading || depositAndSendContext.send.loading;

    // Do the send. This will only run once because the
    // dependency array is empty.
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
        depositAndSendContext.submit({
            sender: userProfileContext.email,
            recipient: recipient.email,
            amount: amount,
            depositAmount: depositAmount,
            senderSigner: userProfileContext.wallet.getKeypair()
        });
    }, []);

    useEffect(() => {
        if (depositAndSendContext.deposit.error) {
            console.error("DEPOSIT ERROR", depositAndSendContext.deposit.error);
        }
    }, [depositAndSendContext.deposit.error]);

    useEffect(() => {
        if (depositAndSendContext.send.error) {
            console.error("SEND ERROR", depositAndSendContext.send.error);
        }
    }, [depositAndSendContext.send.error]);

    return (
        <Screen>
            <View flexG padding-md style={{ paddingBottom: 66 }}>
                <View flexG center gap-sm>
                    <Text gray-dark bold style={STYLES.amount}>{formatUsd(amount)}</Text>
                    <RecipientProfile {...recipient} />
                    {(needsDeposit) && (
                        <View>
                            <TransactionStatus
                                {...depositAndSendContext.deposit}
                                defaultContent={
                                    <Text text-md gray-gray-medium>
                                        loading
                                    </Text>
                                }
                                loadingContent={
                                    <Text text-md gray-dark>
                                        depositing {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                                errorContent={
                                    <Text text-md error>
                                        failed to deposit {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                                successContent={
                                    <Text text-md gray-gray-medium>
                                        deposited {formatUsd(depositAmount)} to your account
                                    </Text>
                                }
                            />

                            <TransactionStatus
                                {...depositAndSendContext.send}
                                defaultContent={<Text />}
                                loadingContent={
                                    <Text text-md gray-dark>
                                        sending {formatUsd(amount)} from your account
                                    </Text>
                                }
                                errorContent={
                                    <Text text-md error>
                                        failed to send {formatUsd(amount)} from your account
                                    </Text>
                                }
                                successContent={
                                    <Text text-md gray-gray-medium>
                                        sent {formatUsd(amount)} from your account
                                    </Text>
                                }
                            />
                        </View>
                    )}
                </View>
                <Button
                    tertiary
                    label="Done"
                    disabled={loading}
                    onPress={() => props.navigation.getParent()?.navigate(TopNavScreen.HOME)}
                />
            </View>
        </Screen>
    )
}


interface TransactionStatusProps {
    loading: boolean;
    success: boolean | undefined;
    error: any | undefined;
    defaultContent: JSX.Element;
    loadingContent: JSX.Element;
    successContent: JSX.Element;
    errorContent: JSX.Element;
}


function TransactionStatus(props: TransactionStatusProps): JSX.Element {
    const badgeColor: string | undefined = useMemo(() => {
        if (props.loading) return COLORS.primaryMedium;
        return "transparent";
    }, [props.loading, props.success, props.error]);

    const badgeLabel: string | undefined = useMemo(() => {
        if (props.success) return "✓";
        return undefined;
    }, [props.loading, props.success, props.error]);

    const badgeLabelColor: string | undefined = useMemo(() => {
        if (props.error) return COLORS.error;
        if (props.loading) return COLORS.grayLight;
        return COLORS.grayMedium;
    }, [props.loading, props.success, props.error]);

    const renderBadge: boolean = (badgeLabel != null) || (badgeColor != null);

    const content: JSX.Element = useMemo(() => {
        if (props.error) return props.errorContent;
        if (props.loading) return props.loadingContent;
        if (props.success) return props.successContent;
        return props.defaultContent;
    }, [
        props.loadingContent,
        props.successContent,
        props.errorContent,
        props.defaultContent
    ]);

    return (
        <View row gap-sm center>
            {renderBadge && (
                <Badge
                    backgroundColor={badgeColor}
                    label={badgeLabel}
                    labelStyle={{ color: badgeLabelColor }}
                />
            )}
            {content}
        </View>
    );
}


const STYLES = StyleSheet.create({
    amount: {
        fontSize: 53,
    },
})
