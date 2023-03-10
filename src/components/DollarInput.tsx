import { TextStyleProps, ViewStyleProps } from "../common/styles";
import { Text, TextProps } from "./Text";
import { StyleSheet } from "react-native";
import { useCallback, useState } from "react";
import { View } from "./View";
import { TextInput } from "./TextInput";
import { formatUsd } from "../common/number";

type Props = TextProps & TextStyleProps & {
    onSubmit: (value: number) => void;
    onValueChange?: (value: number) => void;
    inputFieldStyle?: ViewStyleProps;
    maxValue?: number;
}

const NUMBER_CHARS: string[] = "0123456789".split("");

export function DollarInput(props: Props): JSX.Element {
    const [value, setValue] = useState<string | undefined>();
    const [validationError, setValidationError] = useState<string | undefined>();

    const onUserInput: (value: string) => void = useCallback((v) => {
        setValidationError(undefined);

        // if user hasnt done any editing then dont try to validate
        if (v === undefined) return;

        const parts: string[] = v.split("").filter(c => NUMBER_CHARS.includes(c));
        if (parts.length === 0) return;
        if (parts.length === 1) {
            v = `0.0${parts[0]}`;

        } else if (parts.length === 2) {
            v = `0.${parts[0]}${parts[1]}`;

        } else {
            v = `${parts.slice(0, -2).join("")}.${parts.slice(-2).join("")}`;
        }

        const valueAsNumber: number = Number.parseFloat(v);
        if (valueAsNumber === 0) {
            setValue(undefined);
            return;
        }

        if (valueAsNumber < 0) {
            setValidationError("Amount must be positive.");
            return;
        }

        if ((props.maxValue != null) && (valueAsNumber > props.maxValue)) {
            setValidationError("Amount cannot exceed " + formatUsd(props.maxValue));
            return;
        }

        if (v !== undefined) {
            const formatter = Intl.NumberFormat("en-US", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                notation: "standard"
            });
            v = formatter.format(Number.parseFloat(v));
        }

        setValue(v);
        if ((v !== undefined) && (props.onValueChange !== undefined)) {
            props.onValueChange(Number.parseFloat(v));
        }
    }, [value]);


    const onSubmit: () => void = useCallback(() => {
        if (value !== undefined) props.onSubmit(Number.parseFloat(value));
    }, [value, props.onSubmit]);


    return (
        <View center>
            <Text text-md gray-medium center error>{validationError}</Text>
            <TextInput
                keyboardType="number-pad"
                value={value}
                placeholder="0.00"
                onChangeText={onUserInput}
                onSubmitEditing={onSubmit}
                leadingAccessory={<Text gray-dark style={STYLES.leadingText}>$</Text>}
                style={STYLES.text}
                autoFocus
                {...props}
            >
                {props.children}
            </TextInput>
        </View>
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
