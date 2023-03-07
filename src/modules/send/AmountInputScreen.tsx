import { useState } from "react";
import { Button } from "../../components/Button";
import { View } from "../../components/View";
import { NumberInput } from "react-native-ui-lib";
import { StyleSheet } from "react-native";
import { COLORS } from "../../common/styles";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.AMOUNT_INPUT>;

export function AmountInputScreen(props: Props): JSX.Element {
    const [amount, setAmount] = useState<number>(0);

    // TODO validation and error messages
    // TODO https://github.com/wix/react-native-ui-lib/blob/master/demo/src/screens/componentScreens/NumberInputScreen.tsx

    return (
        <View paddingT-30 paddingH-30 spread flexG>
            <View flexG centerV>
                {/* @ts-ignore this component's type validation is fucked up*/}
                <NumberInput
                    onChangeNumber={(v: { number: number }) => setAmount(v.number)}
                    onSubmitEditing={() => props.navigation.navigate(
                        SendNavScreen.CONFIRM,
                        { ...props.route.params, amount: amount }
                    )}
                    leadingText="$"
                    fractionDigits={2}
                    style={STYLES.text}
                    leadingTextStyle={STYLES.text}
                    centered
                    autoFocus
                />
            </View>
            <Button
                secondary
                label="Cancel"
                onPress={props.navigation.pop}
            />
        </View>
    )
}


const STYLES = StyleSheet.create({
    text: {
        fontSize: 48,
        color: COLORS.secondaryLight
    }
})
