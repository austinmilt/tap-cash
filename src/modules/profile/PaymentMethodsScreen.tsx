import { StyleSheet } from "react-native";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import React, { useEffect } from "react";
import { ProfileNavScreen, ProfileStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GridList, Image } from "react-native-ui-lib";
import { Screen } from "../../components/Screen";
import { PaymentMethodType } from "../../shared/payment";
import { EnrichedPaymentMethodSummary, useSavedPaymentMethods } from "../../api/client";
import { useUserProfile } from "../../components/profile-provider";
import { Button } from "../../components/Button";

type Props = NativeStackScreenProps<ProfileStackRouteParams, ProfileNavScreen.PAYMENT_METHODS>;

export function PaymentMethodsScreen(props: Props): JSX.Element {
    const userProfileContext = useUserProfile();
    const paymentMethodContext = useSavedPaymentMethods();

    useEffect(() => {
        if (userProfileContext.email != null) {
            paymentMethodContext.submit({
                memberEmail: userProfileContext.email
            });
        }
    }, [userProfileContext.email])

    return (
        <Screen padding-md spread>
            <View>
                <Text gray-medium text-sm>
                    ADDED
                </Text>
                <GridList
                    numColumns={1}
                    data={paymentMethodContext.data}
                    renderItem={item => <PaymentMethodItem {...item.item} />}
                />
            </View>
            <Button primary label="Add Payment Method" disabled onPress={() => { }} />
        </Screen>
    )
}


function PaymentMethodItem(props: EnrichedPaymentMethodSummary): JSX.Element {
    if (props.type === PaymentMethodType.CREDIT_CARD) {
        return <CreditCardItem {...(props as Required<EnrichedPaymentMethodSummary>)} />

    } else {
        throw new Error("Cannot display payment methods of type " + PaymentMethodType[props.type]);
    }
}


function CreditCardItem(props: Required<EnrichedPaymentMethodSummary>): JSX.Element {
    return (
        <View flexS row centerV left style={{ marginTop: 16 }}>
            <View row gap-md>
                <View center style={STYLES.ccIcon}>
                    <Image source={props.iconSource.square} resizeMode="contain"
                    />
                </View>
                <View centerV left>
                    <View>
                        <Text text-md gray-dark>{`•••• •••• •••• ${props.creditCard.lastFourDigits}`}</Text>
                        <Text text-sm gray-medium>
                            {props.creditCard.holderName} • Expires {props.creditCard.expiration}
                        </Text>
                    </View>
                </View>
            </View>
            {/* TODO tried to get this to right-align but couldnt, so figure out how to
            style it correctly (should be `spread` on the parent view but no dice)
            <Text text-lg secondary-medium>✓</Text> */}
        </View>
    )
}


const STYLES = StyleSheet.create({
    ccIcon: {
        height: 56,
        width: 56
    }
});
